import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import abi from '../abi/product-abi.json';

const SellProduct = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const onSubmit = async (data) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask or another Web3 provider is not installed.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, abi, signer);

      const sellerCode = ethers.utils.formatBytes32String(data.sellercode);
      const productSN = ethers.utils.formatBytes32String(data.productsn);

      const tx = await contract.manufacturerSellProduct(productSN, sellerCode);
      await tx.wait();
      reset();
      alert("Product sold successfully!");
    }  catch (error) {
          console.error("Error selling product:", error);
          alert("Failed to sell product. Check the console for details.");
      }
  };


  return (
    <div className="font-monosans">
      <p className='text-3xl font-bold text-center'>Manufacturer pvt. ltd.</p>
      <div className="flex justify-center space-x-4 my-10 text-4xl">
        Sell Product to your trustworthy Seller
      </div>
      <div className="mx-auto xl:px-96">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 xl:mx-80">
          <div>
            <Label htmlFor="sellercode" className="block mb-1">Seller Code</Label>
            <Input
              id="sellercode"
              placeholder="Seller Code"
              type="text"
              {...register('sellercode', { required: 'Seller Code is required' })}
              className="w-full"
            />
            {errors.sellercode && <p className="text-red-500 text-sm">{errors.sellercode.message}</p>}
          </div>

          <div>
            <Label htmlFor="productsn" className="block mb-1">Product SN</Label>
            <Input
              id="productsn"
              placeholder="Product SN"
              type="text"
              {...register('productsn', { required: 'Product SN is required' })}
              className="w-full"
            />
            {errors.productsn && <p className="text-red-500 text-sm">{errors.productsn.message}</p>}
          </div>
          <div className=" flex justify-center items-center">
          <Button type="submit" className="w-4/5 mx-10 items-center bg-yellow-300 text-black font-bold py-2 rounded hover:bg-yellow-500">
            Sell Product
          </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellProduct;

