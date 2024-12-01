import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abi/product-abi.json"; 
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
import QRCode from "react-qr-code"; 
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline"; 
const contractAddress = "0x2630d7B3A18B14c96fF952cD3139AeC4764f0066"; 
function DisplayProducts() {
    const [productItems, setProductItems] = useState([]);

    useEffect(() => {
        fetchProductItems();
    }, []);

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
                productSN: ethers.utils.parseBytes32String(pSNs[index]),
                productName: ethers.utils.parseBytes32String(pnames[index]),
                productBrand: ethers.utils.parseBytes32String(pbrands[index]),
                productPrice: ethers.utils.formatUnits(pprices[index], "ether"), 
                productStatus: ethers.utils.parseBytes32String(pstatus[index]),
            }));
            setProductItems(products);
        } catch (error) {
            console.error("Error fetching data from contract:", error);
            alert("Failed to fetch product data.");
        }
    };
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
            link.download = `${data.productname}_${data.productsn}_QRCode.png`;
            link.href = url;
            link.click();
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of added products.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Product SN</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price (Rs)</TableHead>
                        <TableHead className="text-right pr-12">Secured QR Code</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {productItems.length > 0 ? (
                        productItems.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>{product.productId}</TableCell>
                                <TableCell>{product.productName}</TableCell>
                                <TableCell>{product.productSN}</TableCell>
                                <TableCell>{product.productBrand}</TableCell>
                                <TableCell>{product.productPrice}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center space-x-2">
                                        <QRCode
                                            id={`qr-code-${product.productSN}`}
                                            value={JSON.stringify({
                                                productId: product.productId,
                                                productName: product.productName,
                                                productSN: product.productSN,
                                                productBrand: product.productBrand,
                                                productPrice: product.productPrice,
                                            })}
                                            size={50}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <Button variant="link" onClick={() => downloadQRCode(product)}>
                                            <DownloadForOfflineIcon fontSize="large" />
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
    );
}

export default DisplayProducts;
