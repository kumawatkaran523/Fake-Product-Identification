import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MainLayout from './layout/Mainlayout';
import Manufacturer from './pages/Manufacturer';
import Addseller from './pages/Addseller';
import SellProduct from './pages/SellProductToSeller';
import Consumer from './pages/Consumer';
import Seller from './pages/Seller';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manufacturer" element={<MainLayout />}>
          <Route index element={<Manufacturer />} />
           <Route path="addseller" element={<Addseller />} />
          <Route path="sellproduct" element={<SellProduct />} />
        </Route> 
        <Route path="/consumer" element={<Consumer />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
