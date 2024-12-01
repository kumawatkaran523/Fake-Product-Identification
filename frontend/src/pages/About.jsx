import Navbar from '@/components/Navbar';
import React from 'react';

function About() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 font-monosans">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">About Our Project</h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to our project! We are developing a cutting-edge solution designed to streamline the verification process for products using blockchain technology. This system ensures product authenticity and helps users track product purchase history seamlessly. Our application is integrated with a smart contract deployed on the Ethereum blockchain, enabling secure and transparent transactions.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technologies Used</h2>
        <ul className="list-disc pl-6 space-y-3 text-lg text-gray-700">
          <li><strong className="font-medium">React.js</strong>: We use React.js for building a dynamic, responsive user interface with a smooth user experience.</li>
          <li><strong className="font-medium">Blockchain (Ethereum)</strong>: The project leverages Ethereum smart contracts to verify product authenticity and manage purchase history. Ethereum's decentralized nature ensures that the data is immutable and secure.</li>
          <li><strong className="font-medium">MetaMask</strong>: MetaMask is used for connecting to the Ethereum blockchain, allowing users to interact with the smart contract directly from their browser.</li>
          <li><strong className="font-medium">Ethers.js</strong>: These libraries help us interact with the Ethereum blockchain, enabling functions like sending transactions and querying smart contracts.</li>
          <li><strong className="font-medium">HTML5 QR Code Scanner</strong>: We use the HTML5 QR code scanner to scan product QR codes, which are then verified through the blockchain network for authenticity.</li>
          <li><strong className="font-medium">CSS / Tailwind CSS</strong>: For styling, we use Tailwind CSS, which provides a highly customizable and efficient way to design our app’s UI.</li>
          <li><strong className="font-medium">Vite</strong>: Vite is used for bundling and serving our React app. It provides fast build times and optimized development workflows.</li>
          <li><strong className="font-medium">Node.js & Express</strong>: Our backend API is built using Node.js and Express, handling product verification, transaction processing, and database management.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Features</h2>
        <ul className="list-disc pl-6 space-y-3 text-lg text-gray-700">
          <li><strong className="font-medium">Product Verification:</strong> Scan a product's QR code to verify its authenticity via the blockchain.</li>
          <li><strong className="font-medium">Purchase History:</strong> Retrieve detailed purchase history for a specific consumer, including manufacturer and seller information.</li>
          <li><strong className="font-medium">Blockchain Transparency:</strong> All data related to product authenticity is stored securely on the Ethereum blockchain, ensuring transparency and trust.</li>
          <li><strong className="font-medium">Real-Time Updates:</strong> Product information, purchase status, and verification status are updated in real time, providing users with the most current data.</li>
          <li><strong className="font-medium">QR Code Scanning:</strong> Scan QR codes to quickly input product details and verify information without manual entry.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How It Works</h2>
        <p className="text-lg text-gray-700 mb-6">
          Our application allows users to scan a QR code on a product. The scanned data is sent to our Ethereum-based smart contract, which verifies the product’s authenticity and retrieves purchase history. The system provides detailed information about the product, including its manufacturer, seller, and purchase history.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Team Members (Optional)</h2>
        <p className="text-lg text-gray-700">
          Our team consists of dedicated developers and blockchain enthusiasts committed to building innovative solutions for product verification. Each member brings a unique set of skills to the table, contributing to the success of this project.
        </p>
      </div>
    </div>
  );
}

export default About;
