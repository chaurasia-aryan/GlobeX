import { expect } from "chai";
import { network } from "hardhat";

describe("TradeEscrow", function () {
  let token: any;
  let escrow: any;
  let ethers: any;
  let arbiter: any, buyer: any, seller: any, other: any;

  const AMOUNT = 550_000n * 10n ** 6n; // 550,000 mUSDC (6 decimals)

  // ============================================================
  // DEPLOY CONTRACTS + FUND BUYER
  // ============================================================

  async function deployAll() {
    const conn = await network.connect();
    ethers = conn.ethers;

    const signers = await ethers.getSigners();
    arbiter = signers[0];
    buyer = signers[1];
    seller = signers[2];
    other = signers[3];

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const tokenContract = await MockUSDC.deploy();
    await tokenContract.waitForDeployment();

    const TradeEscrow = await ethers.getContractFactory("TradeEscrow");
    const escrowContract = await TradeEscrow.deploy(arbiter.address);
    await escrowContract.waitForDeployment();

    // Seed buyer with 2x the escrow amount so insufficient-balance tests
    // have a clean amount to exceed.
    await (await tokenContract.mint(buyer.address, AMOUNT * 2n)).wait();

    return { token: tokenContract, escrow: escrowContract };
  }

  beforeEach(async function () {
    const deployed = await deployAll();
    token = deployed.token;
    escrow = deployed.escrow;
  });

  async function createDefaultEscrow(tradeId: string) {
    const tokenAddress = await token.getAddress();
    await escrow.createEscrow(tradeId, buyer.address, seller.address, tokenAddress, AMOUNT);
  }

  async function approveAndFund(tradeId: string) {
    const escrowAddress = await escrow.getAddress();
    await token.connect(buyer).approve(escrowAddress, AMOUNT);
    await escrow.connect(buyer).fund(tradeId);
  }

  // ============================================================
  // TEST 1 — CREATE
  // ============================================================

  describe("createEscrow", function () {
    it("creates a PENDING escrow with the correct fields", async function () {
      await createDefaultEscrow("TX-ESC-001");

      const e = await escrow.getEscrow("TX-ESC-001");
      expect(e.tradeId).to.equal("TX-ESC-001");
      expect(e.buyer).to.equal(buyer.address);
      expect(e.seller).to.equal(seller.address);
      expect(e.amount).to.equal(AMOUNT);
      expect(e.state).to.equal(1n); // State.PENDING
    });

    it("reverts on a duplicate tradeId", async function () {
      await createDefaultEscrow("TX-ESC-002");

      await expect(createDefaultEscrow("TX-ESC-002")).to.be.revertedWithCustomError(
        escrow,
        "EscrowAlreadyExists"
      );
    });

    it("reverts when a non-arbiter tries to create an escrow", async function () {
      const tokenAddress = await token.getAddress();
      await expect(
        escrow.connect(other).createEscrow("TX-ESC-003", buyer.address, seller.address, tokenAddress, AMOUNT)
      ).to.be.revert(ethers);
    });
  });

  // ============================================================
  // TEST 2 — FUND MOVES A REAL BALANCE
  // ============================================================

  describe("fund", function () {
    it("moves a real mUSDC balance from buyer into the escrow contract", async function () {
      await createDefaultEscrow("TX-ESC-010");

      const buyerBalanceBefore: bigint = await token.balanceOf(buyer.address);
      const escrowAddress = await escrow.getAddress();

      await approveAndFund("TX-ESC-010");

      const buyerBalanceAfter: bigint = await token.balanceOf(buyer.address);
      const escrowBalance: bigint = await token.balanceOf(escrowAddress);

      expect(buyerBalanceBefore - buyerBalanceAfter).to.equal(AMOUNT);
      expect(escrowBalance).to.equal(AMOUNT);

      const e = await escrow.getEscrow("TX-ESC-010");
      expect(e.state).to.equal(2n); // State.FUNDED
    });

    it("reverts when funding twice", async function () {
      await createDefaultEscrow("TX-ESC-011");
      await approveAndFund("TX-ESC-011");

      const escrowAddress = await escrow.getAddress();
      await token.connect(buyer).approve(escrowAddress, AMOUNT);

      await expect(escrow.connect(buyer).fund("TX-ESC-011")).to.be.revertedWithCustomError(
        escrow,
        "WrongState"
      );
    });
  });

  // ============================================================
  // TEST 3 — RELEASE REFUSED WITHOUT ALL CONDITIONS
  // ============================================================

  describe("release — conditions not met", function () {
    it("reverts with ConditionsNotMet when no conditions are set", async function () {
      await createDefaultEscrow("TX-ESC-020");
      await approveAndFund("TX-ESC-020");

      await expect(escrow.release("TX-ESC-020")).to.be.revertedWithCustomError(
        escrow,
        "ConditionsNotMet"
      );
    });

    it("reverts with ConditionsNotMet when only some conditions are set", async function () {
      await createDefaultEscrow("TX-ESC-021");
      await approveAndFund("TX-ESC-021");

      await escrow.setCondition("TX-ESC-021", 0, true); // DOCS
      await escrow.setCondition("TX-ESC-021", 1, true); // SHIPMENT
      // INSPECTION left false

      await expect(escrow.release("TX-ESC-021")).to.be.revertedWithCustomError(
        escrow,
        "ConditionsNotMet"
      );
    });
  });

  // ============================================================
  // TEST 4 — DISPUTE BLOCKS RELEASE
  // ============================================================

  describe("dispute lock", function () {
    it("blocks release once a dispute has been raised, even if all conditions are met", async function () {
      await createDefaultEscrow("TX-ESC-030");
      await approveAndFund("TX-ESC-030");

      await escrow.setCondition("TX-ESC-030", 0, true);
      await escrow.setCondition("TX-ESC-030", 1, true);
      await escrow.setCondition("TX-ESC-030", 2, true);

      await escrow.connect(buyer).raiseDispute("TX-ESC-030");

      await expect(escrow.release("TX-ESC-030")).to.be.revertedWithCustomError(
        escrow,
        "WrongState"
      );
    });
  });

  // ============================================================
  // TEST 5 — HAPPY PATH RELEASE
  // ============================================================

  describe("release — happy path", function () {
    it("pays the seller exactly amount and empties the escrow balance", async function () {
      await createDefaultEscrow("TX-ESC-040");
      await approveAndFund("TX-ESC-040");

      await escrow.setCondition("TX-ESC-040", 0, true);
      await escrow.setCondition("TX-ESC-040", 1, true);
      await escrow.setCondition("TX-ESC-040", 2, true);

      const sellerBalanceBefore: bigint = await token.balanceOf(seller.address);

      // release() is callable by anyone once conditions are satisfied —
      // exercised here from a non-arbiter account.
      await escrow.connect(other).release("TX-ESC-040");

      const sellerBalanceAfter: bigint = await token.balanceOf(seller.address);
      const escrowAddress = await escrow.getAddress();
      const escrowBalance: bigint = await token.balanceOf(escrowAddress);

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(AMOUNT);
      expect(escrowBalance).to.equal(0n);

      const e = await escrow.getEscrow("TX-ESC-040");
      expect(e.state).to.equal(3n); // State.RELEASED
    });
  });

  // ============================================================
  // TEST 6 — DISPUTE RESOLUTION SPLIT
  // ============================================================

  describe("resolveDispute", function () {
    it("splits funds between seller and buyer according to the arbiter's resolution", async function () {
      await createDefaultEscrow("TX-ESC-050");
      await approveAndFund("TX-ESC-050");
      await escrow.connect(seller).raiseDispute("TX-ESC-050");

      const sellerShare = (AMOUNT * 70n) / 100n;
      const buyerShare = AMOUNT - sellerShare;

      const sellerBalanceBefore: bigint = await token.balanceOf(seller.address);
      const buyerBalanceBefore: bigint = await token.balanceOf(buyer.address);

      await escrow.resolveDispute("TX-ESC-050", sellerShare, buyerShare);

      const sellerBalanceAfter: bigint = await token.balanceOf(seller.address);
      const buyerBalanceAfter: bigint = await token.balanceOf(buyer.address);

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerShare);
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(buyerShare);

      const e = await escrow.getEscrow("TX-ESC-050");
      expect(e.state).to.equal(6n); // State.RESOLVED
    });

    it("reverts when the split does not sum to the escrowed amount", async function () {
      await createDefaultEscrow("TX-ESC-051");
      await approveAndFund("TX-ESC-051");
      await escrow.raiseDispute("TX-ESC-051");

      await expect(
        escrow.resolveDispute("TX-ESC-051", AMOUNT, 1n)
      ).to.be.revertedWithCustomError(escrow, "SplitMismatch");
    });
  });

  // ============================================================
  // TEST 7 — REFUND
  // ============================================================

  describe("refund", function () {
    it("returns the full amount to the buyer", async function () {
      await createDefaultEscrow("TX-ESC-060");
      await approveAndFund("TX-ESC-060");

      const buyerBalanceBefore: bigint = await token.balanceOf(buyer.address);

      await escrow.refund("TX-ESC-060");

      const buyerBalanceAfter: bigint = await token.balanceOf(buyer.address);
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(AMOUNT);

      const e = await escrow.getEscrow("TX-ESC-060");
      expect(e.state).to.equal(4n); // State.REFUNDED
    });
  });

  // ============================================================
  // TEST 8 — ACCESS CONTROL
  // ============================================================

  describe("access control", function () {
    it("reverts when a non-arbiter calls setCondition", async function () {
      await createDefaultEscrow("TX-ESC-070");
      await approveAndFund("TX-ESC-070");

      await expect(escrow.connect(other).setCondition("TX-ESC-070", 0, true)).to.be.revert(ethers);
    });

    it("reverts when a non-arbiter calls resolveDispute", async function () {
      await createDefaultEscrow("TX-ESC-071");
      await approveAndFund("TX-ESC-071");
      await escrow.raiseDispute("TX-ESC-071");

      await expect(escrow.connect(other).resolveDispute("TX-ESC-071", AMOUNT, 0n)).to.be.revert(ethers);
    });

    it("reverts when a non-arbiter calls refund", async function () {
      await createDefaultEscrow("TX-ESC-072");
      await approveAndFund("TX-ESC-072");

      await expect(escrow.connect(other).refund("TX-ESC-072")).to.be.revert(ethers);
    });

    it("reverts when a stranger tries to raise a dispute", async function () {
      await createDefaultEscrow("TX-ESC-073");
      await approveAndFund("TX-ESC-073");

      await expect(escrow.connect(other).raiseDispute("TX-ESC-073")).to.be.revertedWithCustomError(
        escrow,
        "NotAuthorized"
      );
    });
  });

  // ============================================================
  // TEST 9 — FUND FAILURE MODES
  // ============================================================

  describe("fund — failure modes", function () {
    it("reverts when the buyer has not approved the escrow contract", async function () {
      await createDefaultEscrow("TX-ESC-080");
      // No approve() call.
      await expect(escrow.connect(buyer).fund("TX-ESC-080")).to.be.revert(ethers);
    });

    it("reverts when the buyer's balance is insufficient", async function () {
      const tokenAddress = await token.getAddress();
      const hugeAmount = AMOUNT * 100n;
      await escrow.createEscrow("TX-ESC-081", buyer.address, seller.address, tokenAddress, hugeAmount);

      const escrowAddress = await escrow.getAddress();
      await token.connect(buyer).approve(escrowAddress, hugeAmount);

      await expect(escrow.connect(buyer).fund("TX-ESC-081")).to.be.revert(ethers);
    });
  });

  // ============================================================
  // NOT FOUND
  // ============================================================

  describe("getEscrow", function () {
    it("reverts for an unknown tradeId", async function () {
      await expect(escrow.getEscrow("NO-SUCH-TRADE")).to.be.revertedWithCustomError(
        escrow,
        "EscrowNotFound"
      );
    });
  });
});
