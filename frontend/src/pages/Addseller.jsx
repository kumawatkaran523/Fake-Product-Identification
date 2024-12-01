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
import { ethers } from "ethers";
import abi from '../abi/product-abi.json';

function Addseller() {
    const [open, setOpen] = useState(false);
    const [sellers, setSellers] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    const onSubmit = async (data) => {
        try {
            if (!window.ethereum) {
                alert("MetaMask or another Web3 provider is not installed.");
                return;
            }
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log(data);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const manufacturerId = ethers.utils.formatBytes32String(data.manufacturerid);
            const sellername = ethers.utils.formatBytes32String(data.sellername);
            const sellerbrand = ethers.utils.formatBytes32String(data.sellerbrand);
            const sellercode = ethers.utils.formatBytes32String(data.sellercode);
            const sellernum = ethers.BigNumber.from(data.sellernum);
            const sellermanager= ethers.utils.formatBytes32String(data.sellermanager);
            const selleraddress = ethers.utils.formatBytes32String(data.selleraddress);

            const tx = await contract.addSeller(
                manufacturerId,
                sellername,
                sellerbrand,
                sellercode,
                sellernum,
                sellermanager,
                selleraddress
            );
            await tx.wait();

            setSellers([...sellers, data]);
            setOpen(false); 
            reset();
            alert("Product added successfully!");
        } catch (error) {
            console.error("Error adding seller:", error);
            alert("Failed to add seller. Check the console for details.");
        }
    };

    
    const fetchSellers = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask or another Web3 provider is not installed.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const [ids, snames, sbrands, scodes, snums, smanagers, saddress] = await contract.viewSellers();

            const sellersData = ids.map((id, index) => ({
                sellerId: id.toString(),
                sellername: ethers.utils.parseBytes32String(snames[index]),
                sellerbrand: ethers.utils.parseBytes32String(sbrands[index]),
                sellercode: ethers.utils.parseBytes32String(scodes[index]),
                sellernum: snums[index].toString(),
                sellermanager: ethers.utils.parseBytes32String(smanagers[index]),
                selleraddress: ethers.utils.parseBytes32String(saddress[index]),
            }));
            console.log(sellersData)
            setSellers(sellersData);
        } catch (error) {
            console.error("Error fetching sellers:", error);
            alert("Failed to fetch seller data. Check the console for details.");
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    return (
        <>
            <div className="my-8 mt-10 mx-20 font-monosans">
                <p className='text-3xl font-bold text-center'>Manufacturer pvt. ltd.</p>
                <p className='text-xl font-bold'>Add Your new Seller</p>
                <Button variant="outline" className="aspect-square max-sm:p-0 bg-black text-white hover:bg-slate-950 hover:text-white my-5" onClick={() => setOpen(true)}>
                    <Plus className="opacity-80 sm:-ms-1 sm:me-2 " size={16} strokeWidth={2} aria-hidden="true" />
                    <span className="max-sm:sr-only">Add Seller</span>
                </Button>

                <Table>
                    <TableCaption>A list of added sellers.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Seller ID</TableHead>
                            <TableHead>Seller Name</TableHead>
                            <TableHead>Seller Brand</TableHead>
                            <TableHead>Seller Code</TableHead>
                            <TableHead>Seller Number</TableHead>
                            <TableHead>Seller Manager</TableHead>
                            <TableHead>Seller Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers.length > 0 ? (
                            sellers.map((seller, index) => (
                                <TableRow key={index}>
                                    <TableCell>{seller.sellerId}</TableCell>
                                    <TableCell>{seller.sellername}</TableCell>
                                    <TableCell>{seller.sellerbrand}</TableCell>
                                    <TableCell>{seller.sellercode}</TableCell>
                                    <TableCell>{seller.sellernum}</TableCell>
                                    <TableCell>{seller.sellermanager}</TableCell>
                                    <TableCell>{seller.selleraddress}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No sellers added yet.
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
                            <Label htmlFor="sellername" className="block mb-1">Seller Name</Label>
                            <Input
                                id="sellername"
                                placeholder="Seller Name"
                                type="text"
                                {...register('sellername', { required: 'Seller Name is required' })}
                                className="w-full"
                            />
                            {errors.sellername && <p className="text-red-500 text-sm">{errors.sellername.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="sellerbrand" className="block mb-1">Seller Brand</Label>
                            <Input
                                id="sellerbrand"
                                placeholder="Seller Brand"
                                type="text"
                                {...register('sellerbrand', { required: 'Seller Brand is required' })}
                                className="w-full"
                            />
                            {errors.sellerbrand && <p className="text-red-500 text-sm">{errors.sellerbrand.message}</p>}
                        </div>
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
                            <Label htmlFor="sellernum" className="block mb-1">Seller Number</Label>
                            <Input
                                id="sellernum"
                                placeholder="Seller Number"
                                type="number"
                                {...register('sellernum', { required: 'Seller Number is required' })}
                                className="w-full"
                            />
                            {errors.sellernum && <p className="text-red-500 text-sm">{errors.sellernum.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="sellermanager" className="block mb-1">Seller Manager</Label>
                            <Input
                                id="sellermanager"
                                placeholder="Seller Manager"
                                type="text"
                                {...register('sellermanager', { required: 'Seller Manager is required' })}
                                className="w-full"
                            />
                            {errors.sellermanager && <p className="text-red-500 text-sm">{errors.sellermanager.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="selleraddress" className="block mb-1">Seller Address</Label>
                            <Input
                                id="selleraddress"
                                placeholder="Seller Address"
                                type="text"
                                {...register('selleraddress', { required: 'Seller Address is required' })}
                                className="w-full"
                            />
                            {errors.selleraddress && <p className="text-red-500 text-sm">{errors.selleraddress.message}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-yellow-300 text-black font-bold py-2 rounded hover:bg-yellow-500">
                                Add Seller
                            </Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>
        </>
    );
}

export default Addseller;


