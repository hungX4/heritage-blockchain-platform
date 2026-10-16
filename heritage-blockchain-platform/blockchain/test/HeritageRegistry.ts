import { expect } from 'chai';
import { network } from 'hardhat';
import { describe, it } from "node:test";
describe("HeritageRegistry", function () {
  async function deployContract() {
    const { ethers } = await network.connect();
    const contract = await ethers.deployContract(
      'HeritageRegistry'
    );

    await contract.waitForDeployment();

    return {
      contract,
      ethers,
    };
  }

  it("should deploy successfully", async function () {
    const { contract, ethers } = await deployContract();

    const address = await contract.getAddress();

    expect(address).to.not.equal(
      ethers.ZeroAddress
    );
  });

  it("should publish and retrieve a heritage version", async function () {
    const { contract, ethers } = await deployContract();

    const heritageId =
      ethers.encodeBytes32String("heritage-001");

    const version = 1;

    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes("snapshot-data")
    );

    await contract.publishVersion(
      heritageId,
      version,
      dataHash
    );

    const result = await contract.getVersion(
      heritageId,
      version
    );

    expect(result[0]).to.equal(dataHash);
    expect(result[1]).to.be.greaterThan(0);
  });

  it("should reject publishing the same version twice", async function () {
    const { contract, ethers } = await deployContract();

    const heritageId =
      ethers.encodeBytes32String("heritage-001");

    const version = 1;

    const dataHash = ethers.keccak256(
      ethers.toUtf8Bytes("snapshot-data")
    );

    await contract.publishVersion(
      heritageId,
      version,
      dataHash
    );

    await expect(
      contract.publishVersion(
        heritageId,
        version,
        dataHash
      )
    ).to.be.revertedWith(
      "Version already published"
    );
  });
});
