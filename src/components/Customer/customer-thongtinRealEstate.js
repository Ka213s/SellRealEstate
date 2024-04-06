import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CallApi from '../CallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomerMenu from './customer-menu';
import UserCustomer from '../../list/userCustomer';

export default function CustomerthongtinRealEstate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [realEstate, setRealEstate] = useState(null);
    const [foundLocation, setFoundLocation] = useState(null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [agencyrInfo, setAgencyrInfo] = useState(null);
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));

    useEffect(() => {
        const fetchRealEstateDetail = async () => {
            try {
                const realEstateResponse = await CallApi.getAllRealEstate();
                const findIdRes = realEstateResponse.find(IdRealestate => IdRealestate.id === parseInt(id));
                console.log('Real Estate:', findIdRes);
                setRealEstate(findIdRes);

                if (findIdRes) {
                    const locationResponse = await CallApi.getAllLocation();
                    const foundLocation = locationResponse.find(location => location.id === findIdRes.locationId);
                    setFoundLocation(foundLocation);

                    const getAllReservations = await CallApi.getAllReservations();
                    const findIdReservations = getAllReservations.find(IdRes => IdRes.id === parseInt(findIdRes.reservationId));
                    console.log('Reservation:', findIdReservations);
                    const callDataAllAccount = await CallApi.getAllAccount();
                    const findIdCustomer = callDataAllAccount.find(IdCus => IdCus.id === parseInt(findIdReservations.customerId));
                    setCustomerInfo(findIdCustomer);
                    const findIdAgency = callDataAllAccount.find(IdCus => IdCus.id === parseInt(findIdReservations.agencyId));
                    setAgencyrInfo(findIdAgency);
                }
            } catch (error) {
                console.error('Error fetching real estate detail:', error);
            }
        };

        fetchRealEstateDetail();
    }, [id]);
    const handleViewDetails = () => {
        // Chuyển đến trang chi tiết bất động sản và gửi kèm ID
        navigate(`/real-estate-detail/${id}`);
    };
    const getRealEstateStatusById = (realEstateId) => {
        switch (realEstateId) {
            case 2:
                return 'Đang mở bán';
            case 3:
                return 'Đang chờ phê duyệt cọc';
            case 4:
                return 'Đã Đặt Cọc';
            case 5:
                return 'Đang chờ phê duyệt bán';
            case 6:
                return 'Phê duyệt bán thành công';
            default:
                return 'Trạng thái không xác định';
        }
    };

    return (
        <div className='container'>
         
            <CustomerMenu
                userLoginBasicInformationDto={userLoginBasicInformationDto}
                UserMenu={UserCustomer}
            />
            <div className='table-container' style={{ marginRight: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
                    <div className="customer-info">
                        <h2 className="title">Thông tin chi tiết Villa</h2>
                        {realEstate && (
                            <>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ marginRight: '5px' }}>Trạng thái: </div>
                                    <div className="status"> {getRealEstateStatusById(realEstate.status)}</div>
                                </div>
                                <p>Tên bất động sản: {realEstate.realestateName}</p>
                                {foundLocation && (
                                    <>
                                        <p>Tỉnh: {foundLocation.city}</p>
                                        <p>Quận: {foundLocation.district}</p>
                                        <p>Phường: {foundLocation.ward}</p>
                                    </>
                                )}
                                <button onClick={handleViewDetails}>Xem chi ti</button> 
                            </>
                        )}
                    </div>
                    {/* {customerInfo && (
                        <div className="customer-info">
                            <h2 className="title">Thông tin khách hàng</h2>
                            <p>Tên khách hàng: {customerInfo.username}</p>
                            <p>Số điện thoại: {customerInfo.phoneNumber}</p>
                            <p>Email: {customerInfo.email}</p>
                        </div>
                    )} */}
                    {agencyrInfo && (
                        <div className="customer-info">
                            <h2 className="title">Thông tin Agency</h2>
                            <p>Tên khách hàng: {agencyrInfo.username}</p>
                            <p>Số điện thoại: {agencyrInfo.phoneNumber}</p>
                            <p>Email: {agencyrInfo.email}</p>
                        </div>
                    )}
                </div>
                {(realEstate?.firebaseId || realEstate?.customerDepositContract) && (
                    <div className='customer-info' style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                        <h2 className="title" style={{ fontSize: '30px' }}>Ảnh Đặt Cọc</h2>
                        <div style={{ display: 'flex' }}>
                            <div>
                                <h2 className="title">Agency</h2>
                                <hr></hr>
                                {realEstate?.firebaseId ? (
                                    <img
                                        src={realEstate.firebaseId}
                                        alt="Ảnh Đặt Cọc"
                                        style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }}
                                        className="image"
                                    />
                                ) : (
                                    <span>Chưa up ảnh</span>
                                )}
                            </div>
                            <div>
                                <h2 className="title">Khách hàng</h2>
                                <hr></hr>
                                {realEstate?.customerDepositContract ? (
                                    <img
                                        src={realEstate.customerDepositContract}
                                        alt="Ảnh Đặt Cọc"
                                        style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }}
                                        className="image"
                                    />
                                ) : (
                                    <span>Chưa up ảnh</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {(realEstate?.contract || realEstate?.customerSellContract) && (
                    <div className='customer-info' style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                        <h2 className="title">Ảnh Hợp Đồng</h2>
                        {realEstate?.contract && (
                            <img
                                src={realEstate.contract}
                                alt="Ảnh Đặt Cọc"
                                style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }}
                                className="image"
                            />
                        )}
                        {realEstate?.customerSellContract && (
                            <img
                                src={realEstate.customerSellContract}
                                alt="Ảnh Đặt Cọc"
                                style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }}
                                className="image"
                            />
                        )}
                    </div>
                )}
                <ToastContainer /> {/* Global toast notification */}
            </div>
        </div>
    );
}
