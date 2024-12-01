
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import abi from '../abi/product-abi.json';
import { useForm } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import QRCode from "react-qr-code";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { Button as Btn } from "@mui/material";
import SellIcon from '@mui/icons-material/Sell';

function Seller() {
  const [open, setOpen] = useState(false);
  const { register: registerSeller, handleSubmit: handleSubmitSeller, formState: { errors: errorsSeller }, reset: resetSeller } = useForm();
  const { register: registerConsumer, handleSubmit: handleSubmitConsumer, formState: { errors: errorsConsumer }, reset: resetConsumer } = useForm();

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const [sellerCode, setSellerCode] = useState("")
  const [consumerCode, setConsumerCode] = useState("")
  const [products, setProducts] = useState([]);

  const downloadQRCode = (data) => {
    const svg = document.querySelector(`#qr-code-${data.productsn}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const size = 200; // Define the size of the canvas
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${data.productname}_QRCode.png`;
      link.href = url;
      link.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const onSubmitSeller = async (data) => {
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
      const [pids, pSNs, pnames, pbrands, pprices, pstatus] = await contract.queryProductsList(sellerCode);

      const prod = pids.map((id, index) => ({
        productId: id.toString(),
        productsn: ethers.utils.parseBytes32String(pSNs[index]),
        productname: ethers.utils.parseBytes32String(pnames[index]),
        productbrand: ethers.utils.parseBytes32String(pbrands[index]),
        productprice: ethers.utils.formatUnits(pprices[index], "wei"),
        productstatus: ethers.utils.parseBytes32String(pstatus[index]),
      }));
      setProducts(prod);
      setSellerCode(data.sellercode);
      resetSeller();
    } catch (error) {
      console.error("Error finding selling products:", error);
      alert("Failed to find seller product", error);
    }
  };

  const onSubmitConsumer = async (data) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask or another Web3 provider is not installed.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const productSN = ethers.utils.formatBytes32String(data.productsn);
      const consumerCode = ethers.utils.formatBytes32String(data.consumercode);
      setConsumerCode(consumerCode);

      const tx = await contract.sellerSellProduct(productSN, consumerCode);
      await tx.wait();

      const soldProduct = products.find(product => product.productsn === data.productsn);
      if (soldProduct) {
        setProducts(prevState => {
          const updatedProducts = prevState.map(product => {
            if (product.productsn === soldProduct.productsn) {
              return { ...product, isSold: true };
            }
            return product;
          });
          return updatedProducts;
        });
      }

      setOpen(false);
      resetConsumer();
    } catch (error) {
      console.error("Error selling product:", error);
      alert(`Failed to sell product: ${error.message}`);
    }
  };

  return (
    <div className="font-monosans">
      <Navbar />
      <p className="text-4xl font-bold text-center mt-20">Welcome to Your Seller Dashboard</p>
      <div className="py-4 flex justify-center items-center">
        <form onSubmit={handleSubmitSeller(onSubmitSeller)} className="flex items-center w-1/3">
          <Input
            id="sellercode"
            placeholder="Please enter your Seller Code to retrieve available products"
            type="text"
            className="py-6 mx-3"
            {...registerSeller('sellercode', { required: 'Seller Code is required' })}
          />
          {errorsSeller.sellercode && <p className="text-red-500 text-sm">{errorsSeller.sellercode.message}</p>}
          <Button type="submit" className="bg-yellow-300 py-6 text-black hover:bg-yellow-400">
            Submit
          </Button>
        </form>
      </div>

      <div className="flex justify-center space-x-4 my-5 text-3xl">
        Sell Product to your trustworthy Seller
      </div>

      <div className="mx-40">
        <Table>
          <TableCaption>A list of added products.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Your Seller Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Product SN</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price (Rs)</TableHead>
              <TableHead>Product Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <TableRow key={product.productId}>
                  <TableCell>{sellerCode}</TableCell>
                  <TableCell>{product.productname}</TableCell>
                  <TableCell>{product.productsn}</TableCell>
                  <TableCell>{product.productbrand}</TableCell>
                  <TableCell>{product.productprice} Rs</TableCell>
                  <TableCell>{product.productstatus}</TableCell>

                  {/* Conditionally render the QR code if the product is sold */}
                  {product.isSold ? (
                    <TableCell className="flex items-center justify-end space-x-2">
                      <QRCode
                        id={`qr-code-${product.productsn}`}
                        value={JSON.stringify({
                          productname: product.productname,
                          productsn: product.productsn,
                          productbrand: product.productbrand,
                          productprice: product.productprice,
                          consumercode: consumerCode
                        })}
                        size={70}
                      />
                      <Btn variant="link" onClick={() => downloadQRCode(product)}>
                        <DownloadForOfflineIcon />
                        Download
                      </Btn>
                    </TableCell>
                  ) : (
                    <TableCell className="text-right mr-10">
                      <Button className='px-10' onClick={() => setOpen(true)}><SellIcon />Sell</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No products added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen} className='font-monosans'>
        <DialogContent className="sm:max-w-lg mx-auto font-monosans">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Sell Product</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Fill out the form below to sell a product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitConsumer(onSubmitConsumer)} className="space-y-6">
            <div>
              <Label htmlFor="productsn" className="block mb-1">Product Serial Number</Label>
              <Input
                id="productsn"
                placeholder="Product SN"
                type="text"
                {...registerConsumer('productsn', { required: 'Product SN is required' })}
                className="w-full"
              />
              {errorsConsumer.productsn && <p className="text-red-500 text-sm">{errorsConsumer.productsn.message}</p>}
            </div>

            <div>
              <Label htmlFor="consumercode" className="block mb-1">Consumer Code</Label>
              <Input
                id="consumercode"
                placeholder="Consumer Code"
                type="text"
                {...registerConsumer('consumercode', { required: 'Consumer Code is required' })}
                className="w-full"
              />
              {errorsConsumer.consumercode && <p className="text-red-500 text-sm">{errorsConsumer.consumercode.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className='w-full bg-yellow-300 text-black hover:bg-yellow-400'>Add Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Seller