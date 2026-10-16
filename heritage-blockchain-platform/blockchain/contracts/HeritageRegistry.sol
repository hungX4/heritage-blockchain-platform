// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HeritageRegistry {
    struct HeritageVersion {
        bytes32 dataHash;
        uint256 timestamp;
    }

    mapping(bytes32 => HeritageVersion) private versions;

    event HeritageVersionPublished(
        bytes32 indexed heritageId,
        uint256 indexed version,
        bytes32 dataHash,
        uint256 timestamp
    );

    function publishVersion(
        bytes32 heritageId,
        uint256 version,
        bytes32 dataHash
    ) external {
        bytes32 key = keccak256(
            abi.encodePacked(heritageId, version)
        );

        require(
            versions[key].timestamp == 0,
            "Version already published"
        );

        versions[key] = HeritageVersion({
            dataHash: dataHash,
            timestamp: block.timestamp
        });

        emit HeritageVersionPublished(
            heritageId,
            version,
            dataHash,
            block.timestamp
        );
    }

    function getVersion(
        bytes32 heritageId,
        uint256 version
    )
        external
        view
        returns (
            bytes32 dataHash,
            uint256 timestamp
        )
    {
        bytes32 key = keccak256(
            abi.encodePacked(heritageId, version)
        );

        HeritageVersion memory record = versions[key];

        return (
            record.dataHash,
            record.timestamp
        );
    }
}
