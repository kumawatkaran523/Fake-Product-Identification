import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <div className='flex justify-between mx-auto px-28 my-6 font-monosans'>
            <p><img src='Verified_logo.png' alt="" height={140} width={140} loading='lazy'/></p>
            <div>
                <Link to='/' className='mx-2' >Home</Link>
                <Link to='/manufacturer' className='mx-2'>Manufacturer</Link>
                <Link to='/seller' className='mx-2'>Seller</Link>
                <Link to='/consumer' className='mx-2'>Consumer</Link>
                <Link to='/about' className='mx-2'>About Us</Link>
            </div>
        </div>
    );
}

export default Navbar;
