import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Adminmenu from "./admin-menu";
import UserAdmin from '../../list/userIAdmin';
import CallApi from '../CallApi';
import { Call } from '@mui/icons-material';

export default function Agencyduyettindang() {
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    const [realEstates, setRealEstates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRealEstates = async () => {
            try {
                const response = await CallApi.getAllRealEstate();
                const filteredRealEstates = response.filter(realEstate => realEstate.status === 1);
                console.log("Danh sách bất động sản cần được duyệt:", filteredRealEstates);
                setRealEstates(filteredRealEstates);
            } catch (error) {
                console.error('Error fetching real estates:', error);
            }
        };

        fetchRealEstates();
    }, []);

    const sendNotification = async (accountId, description) => {
        try {
           
            const notification={
                accountId: accountId,
                description: description
            }
            console.log('Thông báo:', notification);
            CallApi.createNotification(notification);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const handleDuyet = async (realEstateId, accountId, realestateName) => {
        try {
            const realEstateDetails = await getRealEstateDetails(realEstateId);
            await axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/invester/updatePostById/${realEstateId}`, { ...realEstateDetails, status: 2 });
            console.log('Bất động sản có ID', realEstateId, 'đã được duyệt thành công!');
            toast.success('Bất động sản đã được duyệt thành công!');
            const description = `Vào lúc ${new Date().toLocaleString()} Bất động sản ${realestateName} đã được duyệt`;
            sendNotification(accountId, description);

            // Remove the real estate from the list after approving
            setRealEstates(prevRealEstates => prevRealEstates.filter(realEstate => realEstate.id !== realEstateId));
        } catch (error) {
            console.error('Error approving real estate:', error);
            toast.error('Lỗi khi duyệt bất động sản. Vui lòng thử lại sau!');
        }
    };

    const handleKhongDuyet = async (realEstateId, accountId, realestateName) => {
        try {
            const realEstateDetails = await getRealEstateDetails(realEstateId);
            await axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/invester/updatePostById/${realEstateId}`, { ...realEstateDetails, status: 0 });
            console.log('Bất động sản có ID', realEstateId, 'đã bị từ chối thành công!');
            toast.success('Bất động sản đã bị từ chối thành công!');
            const description = `${new Date().toLocaleString()} - ${realestateName} đã bị từ chối`;
            sendNotification(accountId, description);

            // Remove the real estate from the list after rejecting
            setRealEstates(prevRealEstates => prevRealEstates.filter(realEstate => realEstate.id !== realEstateId));
        } catch (error) {
            console.error('Error rejecting real estate:', error);
            toast.error('Lỗi khi từ chối bất động sản. Vui lòng thử lại sau!');
        }
    };

    const getRealEstateDetails = async (realEstateId) => {
        try {
            const realEstateDetails = realEstates.find(item => item.id === realEstateId);
            const locationDetails = await getLocationDetails(realEstateDetails.locationId);

            const filteredRealEstateDetails = { ...realEstateDetails };
            delete filteredRealEstateDetails.id;
            delete filteredRealEstateDetails.firebaseId;
            delete filteredRealEstateDetails.investorId;
            delete filteredRealEstateDetails.direct;
            delete filteredRealEstateDetails.investor;
            delete filteredRealEstateDetails.location;
            delete filteredRealEstateDetails.pay;

            filteredRealEstateDetails.listRealEstateImageUrl = filteredRealEstateDetails.realEstateImages;
            delete filteredRealEstateDetails.realEstateImages;

            if (locationDetails) {
                filteredRealEstateDetails.ward = locationDetails.ward;
                filteredRealEstateDetails.district = locationDetails.district;
                filteredRealEstateDetails.city = locationDetails.city;
            }

            console.log("Thông tin bất động sản có id", realEstateId, ":", filteredRealEstateDetails);
            return filteredRealEstateDetails;
        } catch (error) {
            console.error('Error fetching real estate details:', error);
            return null;
        }
    };

    const getLocationDetails = async (locationId) => {
        try {
            const response = await axios.get(`http://swprealestatev2-001-site1.etempurl.com/api/location/getAllLocation`);
            const locationDetails = response.data.find(location => location.id === locationId);
            return locationDetails || null;
        } catch (error) {
            console.error('Error fetching location details:', error);
            return null;
        }
    };

    const handleNavigateAndSendId = (realEstateId) => {
        navigate(`/thongtinbatdongsan/${realEstateId}`);
    };

    const filteredRealEstates = realEstates.filter(realEstate =>
        realEstate.realestateName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-all-account">
            <div>
                <Adminmenu
                    userLoginBasicInformationDto={userLoginBasicInformationDto}
                    UserMenu={UserAdmin}
                />
            </div>
            <div className='table-container' style={{ marginRight: '100px' }}>
                <div className="account-list">
                    <h2 className="account-list-title" style={{ marginTop: '100px', fontWeight: 'bold' }}> Danh sách bất động sản cần được duyệt</h2>
                    <input
                        type="text"
                        placeholder="Nhập tên bất động sản để lọc"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="account-table">
                        <table className="">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th onClick={() => handleNavigateAndSendId('')} style={{ cursor: 'pointer' }}>Tên bất động sản</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRealEstates.map((realEstate, index) => (
                                    <tr key={realEstate.id} className='danhsachbdscanduyettheobds'>
                                        <td>{index + 1}</td>
                                        <td onClick={() => handleNavigateAndSendId(realEstate.id)} style={{ cursor: 'pointer' }}>{realEstate.realestateName}</td>
                                        <td>
                                            <button className="btn btn-outline-success" onClick={() => handleDuyet(realEstate.id, realEstate.investorId, realEstate.realestateName)}>Duyệt</button>
                                            <button className="btn btn-outline-danger" onClick={() => handleKhongDuyet(realEstate.id, realEstate.investorId, realEstate.realestateName)}>Không duyệt</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
