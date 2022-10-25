// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

contract Request {

    mapping (uint => RequestDetails) public requestDetails;
    uint256 public numRequestDetails;

    function saveRequestDetails(string memory hospitalName, string memory city, string memory country,
                                string memory emailId, string memory amount, string memory description)
                                external {
        

        requestDetails[numRequestDetails].hospitalName = hospitalName;
        requestDetails[numRequestDetails].country = country;
        requestDetails[numRequestDetails].city = city;
        requestDetails[numRequestDetails].emailId = emailId;
        requestDetails[numRequestDetails].amount = amount;
        requestDetails[numRequestDetails].description = description;

        numRequestDetails++;
    }

    struct RequestDetails{
        string hospitalName;
        string country;
        string city;
        string emailId;
        string amount;
        string description;
        //need address also to send money to
    }
}