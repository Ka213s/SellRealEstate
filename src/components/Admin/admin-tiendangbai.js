import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CallApi from '../CallApi';
import Adminmenu from "./admin-menu";
import UserAdmin from '../../list/userIAdmin';
export default function AdminTiendangbai() {
  const [price, setPrice] = useState('');
  const [lastprice, setlastprice] = useState(null);
  const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getAllPostingPrice = await CallApi.getAllPostingPrice();
        const LastPirce = getAllPostingPrice[getAllPostingPrice.length - 1];
        setlastprice(LastPirce.price);
        console.log(getAllPostingPrice);
        console.log('??', LastPirce.price);
      } catch (error) {
        console.error("Error at fetchData", error);
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (price <= 0) {
      alert('Giá tiền đăng bài phải lớn hơn 0');
      return;
    }
    try {
      await axios.post('http://swprealestatev2-001-site1.etempurl.com/api/PostingPrice/CreatePostingPrice', {
        price: price
      });
      setPrice('');
      alert('Price submitted successfully');
    } catch (error) {
      console.error('Error submitting price:', error);
      alert('Failed to submit price. Please try again.');
    }
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  return (
    <div className="admin-all-account">
      <div>
        <Adminmenu
          userLoginBasicInformationDto={userLoginBasicInformationDto}
          UserMenu={UserAdmin}
        />
      </div>
      <div className='table-container' style={{ marginRight: '100px' }}>
        <h2 className="account-list-title" style={{ marginTop: '100px', fontWeight: 'bold' }}>Chỉnh sửa phí đăng bài</h2>
        <form onSubmit={handleSubmit}>
          <p>Phí đăng bài hiện tại: {lastprice}</p>

          <div>
            <label>
              Nhập giá tiền cần chỉnh sửa
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                required
              />
            </label>
          </div>
          <button class="btn btn-outline-success" style={{marginTop:'10px'}} type="submit">Lưu</button>

        </form>
      </div>
    </div>
  );
}
