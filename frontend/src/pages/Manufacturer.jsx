import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Link} from 'react-router-dom';
import { ethers } from "ethers";
import QRCode from "react-qr-code";
import abi from '../abi/product-abi.json';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';


function Manufacturer() {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();


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

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    
    const onSubmit = async (data) => {
        try {
            if (!window.ethereum) {
                alert("MetaMask or another Web3 provider is not installed.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            console.log(provider);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const manufacturerId = ethers.utils.formatBytes32String(data.manufacturerid);
            const productName = ethers.utils.formatBytes32String(data.productname);
            const productSn = ethers.utils.formatBytes32String(data.productsn);
            const productBrand = ethers.utils.formatBytes32String(data.productbrand);
            const productPrice = ethers.BigNumber.from(data.productprice);

            const tx = await contract.addProduct(
                manufacturerId,
                productName,
                productSn,
                productBrand,
                productPrice,
            );
            await tx.wait();

            setProducts([...products, data]); 
            setOpen(false); 
            reset();
            alert("Product added successfully!");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product. Check the console for details.");
        }
    };

    const fetchProductItems = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask or another Web3 provider is not installed.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const [pids, pSNs, pnames, pbrands, pprices, pstatus] = await contract.viewProductItems();

            const products = pids.map((id, index) => ({
                productId: id.toString(), 
                productsn: ethers.utils.parseBytes32String(pSNs[index]),
                productname: ethers.utils.parseBytes32String(pnames[index]),
                productbrand: ethers.utils.parseBytes32String(pbrands[index]),
                productprice: ethers.utils.formatUnits(pprices[index],"wei"), 
                productstatus: ethers.utils.parseBytes32String(pstatus[index]),
            }));

            setProducts(products);
            console.log(products)
        } catch (error) {
            console.error("Error fetching data from contract:", error);
            alert("Failed to fetch product data.");
        }
    };

    useEffect(() => {
        fetchProductItems();
    }, []);


    return (
        <div className='font-monosans'>
            <p className='text-3xl font-bold text-center'>Apex Manufacturing Co.</p>
            <div className="flex justify-center space-x-4 my-3">
                <Button><Link to='addseller'>Add Seller</Link></Button>
                <Button><Link to='sellproduct'>Sell Product to Seller</Link></Button>
            </div>

            <div className="my-8 mt-10 mx-20 font-monosans">
                <Button variant="outline" className="aspect-square max-sm:p-0 bg-black text-white hover:bg-slate-950 hover:text-white my-5" onClick={() => setOpen(true)}>
                    <Plus className="opacity-80 sm:-ms-1 sm:me-2 " size={16} strokeWidth={2} aria-hidden="true" />
                    <span className="max-sm:sr-only">Add new product</span>
                </Button>

                <Table>
                    <TableCaption>A list of added products.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Product SN</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Price (Rs)</TableHead>
                            <TableHead>Product Status</TableHead>
                            <TableHead className="text-right pr-12" >Secured QR Code</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell>{product.productname}</TableCell>
                                    <TableCell>{product.productsn}</TableCell>
                                    <TableCell>{product.productbrand}</TableCell>
                                    <TableCell>{product.productprice} Rs</TableCell>
                                    <TableCell>{product.productstatus}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            <QRCode
                                                id={`qr-code-${product.productsn}`}
                                                value={JSON.stringify({
                                                    manufacturerid: product.manufacturerid,
                                                    productname: product.productname,
                                                    productsn: product.productsn,
                                                    productbrand: product.productbrand,
                                                    productprice: product.productprice,
                                                })}
                                                size={50}
                                                style={{ cursor: "pointer" }}
                                            />

                                            <Button variant="link" onClick={() => downloadQRCode(product)}>
                                                <DownloadForOfflineIcon fontSize='40'/>
                                                Download
                                            </Button>
                                        </div>
                                    </TableCell>
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
                        <DialogTitle className="text-center text-2xl font-bold">Add New Product</DialogTitle>
                        <DialogDescription className="text-center text-gray-500">
                            Fill out the form below to add a new product.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label htmlFor="manufacturerid" className="block mb-1">Manufacturer ID</Label>
                            <Input
                                id="manufacturerid"
                                placeholder="Manufacturer ID"
                                type="text"
                                {...register('manufacturerid', { required: 'Manufacturer ID is required' })}
                                className="w-full"
                            />
                            {errors.manufacturerid && <p className="text-red-500 text-sm">{errors.manufacturerid.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="productname" className="block mb-1">Product Name</Label>
                            <Input
                                id="productname"
                                placeholder="Product Name"
                                type="text"
                                {...register('productname', { required: 'Product Name is required' })}
                                className="w-full"
                            />
                            {errors.productname && <p className="text-red-500 text-sm">{errors.productname.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="productsn" className="block mb-1">Product SN</Label>
                            <Input
                                id="productsn"
                                placeholder="Product Serial Number"
                                type="text"
                                {...register('productsn', { required: 'Product SN is required' })}
                                className="w-full"
                            />
                            {errors.productsn && <p className="text-red-500 text-sm">{errors.productsn.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="productbrand" className="block mb-1">Product Brand</Label>
                            <Input
                                id="productbrand"
                                placeholder="Product Brand"
                                type="text"
                                {...register('productbrand', { required: 'Product Brand is required' })}
                                className="w-full"
                            />
                            {errors.productbrand && <p className="text-red-500 text-sm">{errors.productbrand.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="productprice" className="block mb-1">Product Price (Rs)</Label>
                            <Input
                                id="productprice"
                                placeholder="Product Price"
                                type="number"
                                {...register('productprice', {
                                    required: 'Product Price is required',
                                    valueAsNumber: true,
                                    min: { value: 1, message: 'Price must be greater than 0' },
                                })}
                                className="w-full"
                            />
                            {errors.productprice && <p className="text-red-500 text-sm">{errors.productprice.message}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="submit" className='w-full bg-yellow-300 text-black hover:bg-yellow-400'>Add Product</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Manufacturer;
