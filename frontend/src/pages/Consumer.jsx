import Navbar from '@/components/Navbar';
import React, { useEffect, useState } from 'react';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Button } from '@mui/material';
import abi from '../abi/product-abi.json';
import { ethers } from 'ethers';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Consumer() {
  const [productSN, setProductSN] = useState('');
  const [consumerCode, setConsumerCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [isVerifyClick, setIsVerifyClick] = useState(false)
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const handleVerifyProduct = async () => {
    setIsVerifyClick(true);
    try {
      if (!window.ethereum) {
        alert("MetaMask or another Web3 provider is not installed.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const formattedProductSN = ethers.utils.formatBytes32String(productSN);
      const formattedConsumerCode = ethers.utils.formatBytes32String(consumerCode);

      console.log("Formatted Product SN:", formattedProductSN);
      console.log("Formatted Consumer Code:", formattedConsumerCode);

      const status = await contract.verifyProduct(formattedProductSN, formattedConsumerCode);
      setVerificationStatus(status);

      if (status) {
        const [productSNs, sellerCodes, manufacturerCodes] = await contract.getPurchaseHistory(
          formattedConsumerCode
        );

        const detailedHistory = await Promise.all(
          productSNs.map(async (sn, index) => {
            const sellerCode = sellerCodes[index];
            const manufacturerCode = manufacturerCodes[index];
            let sellerDetails = {};
            if (sellerCode) {
              const [ids, names, brands, codes, nums, managers, addresses] = await contract.viewSellers();
              const sellerIndex = codes.findIndex(
                (code) => ethers.utils.parseBytes32String(code) === ethers.utils.parseBytes32String(sellerCode)
              );
              if (sellerIndex !== -1) {
                sellerDetails = {
                  sellerName: ethers.utils.parseBytes32String(names[sellerIndex]),
                  sellerBrand: ethers.utils.parseBytes32String(brands[sellerIndex]),
                  sellerManager: ethers.utils.parseBytes32String(managers[sellerIndex]),
                  sellerAddress: ethers.utils.parseBytes32String(addresses[sellerIndex]),
                  sellerContact: nums[sellerIndex],
                };
              }
            }

            let productDetails = {};
            const productIndex = await contract.productMap(sn);
            const product = await contract.productItems(productIndex);
            if (product) {
              productDetails = {
                productSN: ethers.utils.parseBytes32String(product.productSN),
                productName: ethers.utils.parseBytes32String(product.productName),
                productBrand: ethers.utils.parseBytes32String(product.productBrand),
                productPrice: product.productPrice.toString(),
                productStatus: ethers.utils.parseBytes32String(product.productStatus),
              };
            }

            return {
              manufacturerCode: ethers.utils.parseBytes32String(manufacturerCode),
              ...productDetails,
              ...sellerDetails,
            };
          })
        );

        // Filter the detailedHistory based on the productSN
        const filteredHistory = detailedHistory.filter(
          (item) => item.productSN === productSN // Filter based on the exact productSN
        );

        console.log("Filtered Purchase History:", filteredHistory);
        setPurchaseHistory(filteredHistory); // Set the filtered data in the state
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationStatus(false);
    }
  };



  useEffect(() => {
    if (isQrScannerOpen) {
      const qrScanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: 250,
      });

      qrScanner.render(
        (decodedText) => {
          setScannedData(decodedText)
          setConsumerCode(decodedText.consumercode)
          setProductSN(decodedText.productsn)
          console.log(decodedText)
          setIsQrScannerOpen(false); 
          handleVerifyProduct();
          qrScanner.clear(); 
        },
        (error) => {
          console.error('Scan Error:', error);
        }
      );

      return () => {
        qrScanner.clear(); // Ensure cleanup on unmount
      };
    }
  }, [isQrScannerOpen]);

  return (
    <div>
      <Navbar />
      <div className='mx-auto px-96 py-10 font-monosans'>
        <h1 className='text-3xl font-bold mb-4'>Welcome, Consumer!</h1>
        <p className='text-lg text-gray-600 mb-8'>
          Verify your purchased products and view your purchase history securely.
        </p>

        <div className='bg-white rounded py-6 mb-8 px-96 shadow-lg'>
          <h2 className='text-xl font-semibold mb-4'>Verify a Product</h2>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>
              Product Serial Number (SN)
            </label>
            <input
              type='text'
              value={productSN}
              onChange={(e) => setProductSN(e.target.value)}
              className='border rounded w-full py-2 px-3 text-gray-700'
              placeholder='Enter Product SN'
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Your Consumer Code</label>
            <input
              type='text'
              value={consumerCode}
              onChange={(e) => setConsumerCode(e.target.value)}
              className='border rounded w-full py-2 px-3 text-gray-700'
              placeholder='Enter Consumer Code'
            />
          </div>

          <div className='flex justify-center items-center'>
            <button
              onClick={handleVerifyProduct}
              className='bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-10 rounded'
            >
              Verify
            </button>
          </div>

          <div className='flex items-center'>
            <hr className='flex-grow border-gray-300 ml-3' />
            <p className='px-4 text-gray-600'>or</p>
            <hr className='flex-grow border-gray-300 mr-3' />
          </div>

          <div className='flex justify-center items-center'>
            <Button onClick={() => setIsQrScannerOpen(true)} className='mx-auto'>
              <QrCodeScannerIcon /> Scan and verify
            </Button>
          </div>


        </div>
        {verificationStatus !== null && (
          <p className={`mt-4 ${verificationStatus ? 'text-green-500' : 'text-red-500'} font-monosans text-2xl flex text-center justify-center items-center`}>
            {verificationStatus ? (
              <>
                <span className="mr-2">✔️</span> Congratulations! Your product has been successfully verified!
              </>
            ) : (
              'Oops! Verification failed. Please try again.'
            )}
          </p>
        )}


        {isQrScannerOpen && (
          <div className='fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-4 rounded'>
              <div id='qr-reader' style={{ width: '300px' }}></div>
              <button
                className='mt-4 bg-yellow-300 text-white py-2 px-4 rounded'
                onClick={() => setIsQrScannerOpen(false)}
              >
                Close Scanner
              </button>
            </div>
          </div>
        )}

        {/* {scannedData && (
          <div className='text-center mt-4'>
            <p className='text-lg text-green-600 font-semibold'>Scanned Data: {scannedData}</p>
          </div>
        )} */}
      </div>
      {isVerifyClick && purchaseHistory && purchaseHistory.length > 0 ? (
        <div className="bg-white rounded py-6 mb-8 mx-96 shadow-lg font-monosans px-7">
          <p className="text-lg font-semibold mb-6 text-center">Purchase History of your product</p>
          <div className="relative border-l-2 border-gray-300 pl-6">
            {purchaseHistory.map((item, index) => (
              <div key={index} className="mb-10 relative">
                <div className="absolute -left-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                {/* Stage 1: Manufacturer Details */}
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-800">Our Product got Manufactured at</p>
                  <ul className="ml-4 mt-2 list-disc text-gray-600">
                    <li><strong>Manufacturer Code:</strong> {item.manufacturerCode || 'N/A'}</li>
                    <li><strong>Manufactured From:</strong> Apex Manufacturing Co.</li>
                    <li><strong>Manufacturing Date:</strong> November 26, 2024</li>
                    <li><strong>Product Name:</strong> {item.productName || 'N/A'}</li>
                    <li><strong>Product Brand:</strong> {item.productBrand || 'N/A'}</li>
                    <li><strong>Product Price:</strong> ₹{item.productPrice || 'N/A'}</li>
                  </ul>
                </div>

                {/* Stage 2: Seller Details */}
                <div className="absolute -left-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 2}
                </div>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-800">Our Product sold to Seller</p>
                  <ul className="ml-4 mt-2 list-disc text-gray-600">
                    <li><strong>Seller Name:</strong> {item.sellerName || 'N/A'}</li>
                    <li><strong>Seller Brand:</strong> {item.sellerBrand || 'N/A'}</li>
                    <li><strong>Seller Manager:</strong> {item.sellerManager || 'N/A'}</li>
                    <li><strong>Seller Address:</strong> {item.sellerAddress || 'N/A'}</li>
                  </ul>
                </div>

                {/* Stage 3: Consumer Details */}
                <div className="absolute -left-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 3}
                </div>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-800">Finally, it reaches you</p>
                  <ul className="ml-4 mt-2 list-disc text-gray-600">
                    <li><strong>Consumer Code:</strong> {consumerCode}</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No purchase history available for this product.</p>
      )}


    </div>
  );
}

export default Consumer;
