import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Adminmenu from './admin-menu';
import UserAdmin from '../../list/userIAdmin';
import CallApi from '../CallApi';
const getStatusString = (status) => {
    switch (status) {
        case 2:
            return 'Đang mở bán';
        case 3:
            return 'Đang chờ phê duyệt cọc';
        case 4:
            return 'Đã được cọc';
        case 5:
            return 'Đang chờ phê duyệt bán';
        case 6:
            return 'Đã bán';
        default:
            return 'Đang chờ cập nhật';
    }
};

const Agencyduyettindang = () => {
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    const [realEstates, setRealEstates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRealEstates = async () => {
            try {
                const response = await axios.get('http://swprealestatev2-001-site1.etempurl.com/api/invester/getAllRealEstate');
                const filteredRealEstates = response.data.filter(realEstate => realEstate.status !== 0);
            
                setRealEstates(filteredRealEstates);
            } catch (error) {
                console.error('Error fetching real estates:', error);
            }
        };

        fetchRealEstates();
    }, []);

    const handleNavigateAndSendId = (realEstateId) => {
        navigate(`/thongtinbatdongsan/${realEstateId}`);
    };

    const filteredRealEstates = realEstates.filter(realEstate =>
        realEstate.realestateName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-all-account">
            <div>
                <Adminmenu userLoginBasicInformationDto={userLoginBasicInformationDto} UserMenu={UserAdmin} />
            </div>
            <div className='table-container' style={{ marginRight: '100px' }}>
                <div className="account-list">
                    <h2 className="account-list-title" style={{ marginTop: '100px', fontWeight: 'bold' }}> Danh sách bất động sản</h2>
                    <input
                        type="text"
                        placeholder="Nhập tên bất động sản để lọc"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="account-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th style={{ cursor: 'pointer' }}>Tên bất động sản</th>
                                    <th>Trạng thái</th>
                                    <th>Xem chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRealEstates.map((realEstate, index) => (
                                    <tr key={realEstate.id} className='danhsachbdscanduyettheobds'>
                                        <td>{index + 1}</td>
                                        <td style={{ cursor: 'pointer' }}>{realEstate.realestateName}</td>
                                        <td>{getStatusString(realEstate.status)}</td>
                                        <td>
                                            <button className="btn btn-outline-success" onClick={() => handleNavigateAndSendId(realEstate.id)}>Tại đây</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Agencyduyettindang;
