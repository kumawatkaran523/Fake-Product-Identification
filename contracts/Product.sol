// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

contract product {
    uint256 sellerCount;
    uint256 productCount;

    struct seller {
        uint256 sellerId;
        bytes32 sellerName;
        bytes32 sellerBrand;
        bytes32 sellerCode;
        uint256 sellerNum;
        bytes32 sellerManager;
        bytes32 sellerAddress;
    }
    mapping(uint => seller) public sellers;

    struct productItem {
        uint256 productId;
        bytes32 productSN;
        bytes32 productName;
        bytes32 productBrand;
        uint256 productPrice;
        bytes32 productStatus;
    }

    mapping(uint256 => productItem) public productItems;
    mapping(bytes32 => uint256) public productMap;
    mapping(bytes32 => bytes32) public productsManufactured;
    mapping(bytes32 => bytes32) public productsForSale;
    mapping(bytes32 => bytes32) public productsSold;
    mapping(bytes32 => bytes32[]) public productsWithSeller;
    mapping(bytes32 => bytes32[]) public productsWithConsumer;
    mapping(bytes32 => bytes32[]) public sellersWithManufacturer;

    //SELLER SECTION

    function addSeller(
        bytes32 _manufacturerId,
        bytes32 _sellerName,
        bytes32 _sellerBrand,
        bytes32 _sellerCode,
        uint256 _sellerNum,
        bytes32 _sellerManager,
        bytes32 _sellerAddress
    ) public {
        sellers[sellerCount] = seller(
            sellerCount,
            _sellerName,
            _sellerBrand,
            _sellerCode,
            _sellerNum,
            _sellerManager,
            _sellerAddress
        );
        sellerCount++;

        sellersWithManufacturer[_manufacturerId].push(_sellerCode);
    }

    function viewSellers()
        public
        view
        returns (
            uint256[] memory,
            bytes32[] memory,
            bytes32[] memory,
            bytes32[] memory,
            uint256[] memory,
            bytes32[] memory,
            bytes32[] memory
        )
    {
        uint256[] memory ids = new uint256[](sellerCount);
        bytes32[] memory snames = new bytes32[](sellerCount);
        bytes32[] memory sbrands = new bytes32[](sellerCount);
        bytes32[] memory scodes = new bytes32[](sellerCount);
        uint256[] memory snums = new uint256[](sellerCount);
        bytes32[] memory smanagers = new bytes32[](sellerCount);
        bytes32[] memory saddress = new bytes32[](sellerCount);

        for (uint i = 0; i < sellerCount; i++) {
            ids[i] = sellers[i].sellerId;
            snames[i] = sellers[i].sellerName;
            sbrands[i] = sellers[i].sellerBrand;
            scodes[i] = sellers[i].sellerCode;
            snums[i] = sellers[i].sellerNum;
            smanagers[i] = sellers[i].sellerManager;
            saddress[i] = sellers[i].sellerAddress;
        }
        return (ids, snames, sbrands, scodes, snums, smanagers, saddress);
    }

    //PRODUCT SECTION

    function addProduct(
        bytes32 _manufactuerID,
        bytes32 _productName,
        bytes32 _productSN,
        bytes32 _productBrand,
        uint256 _productPrice
    ) public {
        productItems[productCount] = productItem(
            productCount,
            _productSN,
            _productName,
            _productBrand,
            _productPrice,
            "Available"
        );
        productMap[_productSN] = productCount;
        productCount++;
        productsManufactured[_productSN] = _manufactuerID;
    }

    function viewProductItems()
        public
        view
        returns (
            uint256[] memory,
            bytes32[] memory,
            bytes32[] memory,
            bytes32[] memory,
            uint256[] memory,
            bytes32[] memory
        )
    {
        uint256[] memory pids = new uint256[](productCount);
        bytes32[] memory pSNs = new bytes32[](productCount);
        bytes32[] memory pnames = new bytes32[](productCount);
        bytes32[] memory pbrands = new bytes32[](productCount);
        uint256[] memory pprices = new uint256[](productCount);
        bytes32[] memory pstatus = new bytes32[](productCount);

        for (uint i = 0; i < productCount; i++) {
            pids[i] = productItems[i].productId;
            pSNs[i] = productItems[i].productSN;
            pnames[i] = productItems[i].productName;
            pbrands[i] = productItems[i].productBrand;
            pprices[i] = productItems[i].productPrice;
            pstatus[i] = productItems[i].productStatus;
        }
        return (pids, pSNs, pnames, pbrands, pprices, pstatus);
    }

    //SELL Product
    function manufacturerSellProduct(
        bytes32 _productSN,
        bytes32 _sellerCode
    ) public {
        productsWithSeller[_sellerCode].push(_productSN);
        productsForSale[_productSN] = _sellerCode;
    }

    function sellerSellProduct(
        bytes32 _productSN,
        bytes32 _consumerCode
    ) public {
        bytes32 pStatus;
        uint256 i;
        uint256 j = 0;

        if (productCount > 0) {
            for (i = 0; i < productCount; i++) {
                if (productItems[i].productSN == _productSN) {
                    j = i;
                }
            }
        }

        pStatus = productItems[j].productStatus;
        if (pStatus == "Available") {
            productItems[j].productStatus = "NA";
            productsWithConsumer[_consumerCode].push(_productSN);
            productsSold[_productSN] = _consumerCode;
        }
    }

    function queryProductsList(
        bytes32 _sellerCode
    )
        public
        view
        returns (
            uint256[] memory,
            bytes32[] memory,
            bytes32[] memory,
            bytes32[] memory,
            uint256[] memory,
            bytes32[] memory
        )
    {
        bytes32[] memory productSNs = productsWithSeller[_sellerCode];
        uint256 length = productSNs.length;

        uint256[] memory pids = new uint256[](length);
        bytes32[] memory pSNs = new bytes32[](length);
        bytes32[] memory pnames = new bytes32[](length);
        bytes32[] memory pbrands = new bytes32[](length);
        uint256[] memory pprices = new uint256[](length);
        bytes32[] memory pstatus = new bytes32[](length);

        for (uint i = 0; i < length; i++) {
            uint256 productId = productMap[productSNs[i]];
            pids[i] = productItems[productId].productId;
            pSNs[i] = productItems[productId].productSN;
            pnames[i] = productItems[productId].productName;
            pbrands[i] = productItems[productId].productBrand;
            pprices[i] = productItems[productId].productPrice;
            pstatus[i] = productItems[productId].productStatus;
        }
        return (pids, pSNs, pnames, pbrands, pprices, pstatus);
    }

    function getDetailedPurchaseHistory(
        bytes32 _consumerCode
    )
        public
        view
        returns (
            bytes32[] memory, // Product Serial Numbers
            bytes32[] memory, // Product Names
            bytes32[] memory, // Product Brands
            uint256[] memory, // Product Prices
            bytes32[] memory, // Seller Names
            bytes32[] memory // Manufacturer Codes
        )
    {
        bytes32[] memory productSNs = productsWithConsumer[_consumerCode];
        uint256 length = productSNs.length;

        bytes32[] memory productNames = new bytes32[](length);
        bytes32[] memory productBrands = new bytes32[](length);
        uint256[] memory productPrices = new uint256[](length);
        bytes32[] memory sellerNames = new bytes32[](length);
        bytes32[] memory manufacturerCodes = new bytes32[](length);

        for (uint i = 0; i < length; i++) {
            uint256 productId = productMap[productSNs[i]];
            productNames[i] = productItems[productId].productName;
            productBrands[i] = productItems[productId].productBrand;
            productPrices[i] = productItems[productId].productPrice;

            bytes32 sellerCode = productsForSale[productSNs[i]];
            for (uint j = 0; j < sellerCount; j++) {
                if (sellers[j].sellerCode == sellerCode) {
                    sellerNames[i] = sellers[j].sellerName;
                    break;
                }
            }

            manufacturerCodes[i] = productsManufactured[productSNs[i]];
        }

        return (
            productSNs,
            productNames,
            productBrands,
            productPrices,
            sellerNames,
            manufacturerCodes
        );
    }

    //Verify

    function verifyProduct(
        bytes32 _productSN,
        bytes32 _consumerCode
    ) public view returns (bool) {
        if (productsSold[_productSN] == _consumerCode) {
            return true;
        } else {
            return false;
        }
    }
}
