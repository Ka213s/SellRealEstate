import React, { useState, useEffect } from 'react';
import CallApi from '../CallApi';
import CustomerMenu from './customer-menu';
import UserCustomer from '../../list/userCustomer';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CustomerLichsumuaban() {
    const navigate = useNavigate(); 
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    const [filteredRealEstates, setFilteredRealEstates] = useState([]);
    const [accounts, setAccounts] = useState([]); // State to store accounts
    const [foundLocation, setFoundLocation] = useState(null);
    const [reservations, setReservations] = useState([]); // State to store reservations

    useEffect(() => {
        async function fetchData() {
            try {
                const allRealEstate = await CallApi.getAllRealEstate();
                const allReservations = await CallApi.getAllReservations();
                setReservations(allReservations); // Set reservations data
                
                // Extracting reservationIds from allReservations
                const reservationIds = allReservations.map(reservation => reservation.id);
                console.log('reservationIds', reservationIds);
                
                // Filtering allRealEstate based on reservationId
                const filteredRealEstate = allRealEstate.filter(estate => reservationIds.includes(estate.reservationId));
                console.log('filteredRealEstate', filteredRealEstate);
                
                // Further filtering based on userLoginBasicInformationDto
                const accountId = userLoginBasicInformationDto.accountId;
                const finalFilteredRealEstate = filteredRealEstate.filter(estate => {
                    return allReservations.some(reservation => reservation.customerId === accountId && reservation.id === estate.reservationId);
                });
                
                console.log('ketqua', finalFilteredRealEstate);
                
                setFilteredRealEstates(finalFilteredRealEstate);

                if (finalFilteredRealEstate.length > 0) {
                    const locationIds = filteredRealEstate.map(estate => estate.locationId);
                    const locationResponse = await CallApi.getAllLocation();
                    const foundLocations = locationResponse.find(location => locationIds.includes(location.id));
                    setFoundLocation(foundLocations); // Set found locations data
                }

                const allAccounts = await CallApi.getAllAccount();
                setAccounts(allAccounts); // Set accounts data
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);
    const handleRealEstateClick = (realEstateId) => {
        navigate(`/khachhang-real-estate/${realEstateId}`); // Navigate to the desired route with real estate ID
    };

    const getUsernameByCustomerId = (customerId) => {
        const account = accounts.find(item => item.id === customerId);
        return account ? account.username : 'Unknown';
    };

    const getRealEstateStatusById = (realEstateId) => {
        switch (realEstateId) {
            case 2:
                return 'Đã hủy';
            case 3:
                return 'Đang chờ phê duyệt cọc';
            case 4:
                return 'Phê duyệt cọc thành công';
            case 5:
                return 'Đang chờ phê duyệt bán';
            case 6:
                return 'Bán thành công';
            default:
                return 'Trạng thái không xác định';
        }
    };
    
    const handleCancelDeposit = async (realEstate) => {
        try {
            if (realEstate && realEstate.realEstateImages) {
                realEstate.listRealEstateImageUrl = realEstate.realEstateImages;
                delete realEstate.realEstateImages;
            }
    
            if (foundLocation) {
                realEstate.city = foundLocation.city;
                realEstate.district = foundLocation.district;
                realEstate.ward = foundLocation.ward;
            }
    
            // Set status to 2 for cancelling deposit
            realEstate.status = 2;
    
            // Update additional fields
            realEstate.firebaseId = null;
            realEstate.customerDepositContract = null;
            realEstate.customerSellContract = null;
            realEstate.contract = null;
            console.log('Responsexx :', realEstate);
            const response = await axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/invester/updatePostById/${realEstate.id}`, realEstate);
           
            axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/customer/updateDepositContractByCustomerPost/${realEstate.id}`, realEstate);
            axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/customer/updateSellContractByCustomerPost/${realEstate.id}`, realEstate);
          
            console.log('Response:', response.data);
            console.log('Real estate deposit cancelled successfully.');
            const getAllReservations = await CallApi.getAllReservations();
            const fillterResvervation = getAllReservations.find(reservation => reservation.id === realEstate.reservationId);
            const realEstatesad = {
                realEstateId : realEstate.id,
                customerId :fillterResvervation.customerId,
                agencyId: fillterResvervation.agencyId,
                status:4,
                bookingDate : fillterResvervation.bookingDate,
                bookingTime : fillterResvervation.bookingTime
            }
           await axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/reservation/UpdateReservation/${realEstate.reservationId}`, realEstatesad);
            // Show success toast
            toast.success('Hủy cọc thành công');
            const thongbao ={
                accountId:fillterResvervation.agencyId,
                description: `Bất động sản ${realEstate.realestateName} đã hủy cọc`
            }
            CallApi.createNotification(thongbao);
            // Reload the page
            // window.location.reload();
        } catch (error) {
            console.error('Error cancelling deposit:', error);
        }
    };
    

    return (
        <div className='container'>
            <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <CustomerMenu
                userLoginBasicInformationDto={userLoginBasicInformationDto}
                UserMenu={UserCustomer}
            />
            <div>
                <h1>Lịch sử mua bán</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Tên Bất Động Sản</th>
                            <th>Tên Khách Hàng</th>
                            <th>Trạng Thái Mua Bán</th>
                            {filteredRealEstates.some(estate => estate.status=== 3 ||estate.status === 4) && <th>Hủy Đặt Cọc</th>}
                            {/* Add more headers if needed */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRealEstates.length === 0 ? (
                            <tr>
                                <td colSpan="4">Không có dữ liệu để hiển thị</td>
                            </tr>
                        ) : (
                            filteredRealEstates.map((estate, index) => (
                                <tr key={index}>
                                   <td onClick={() => handleRealEstateClick(estate.id)} style={{ cursor: 'pointer' }}>{estate.realestateName}</td>
                                    <td>{getUsernameByCustomerId(reservations.find(reservation => reservation.id === estate.reservationId)?.customerId) || 'Unknown'}</td>
                                    <td>{getRealEstateStatusById(estate.status)}</td>
                                    {(estate.status=== 3 ||estate.status === 4)  && (
                                        <td>
                                            <button onClick={() => handleCancelDeposit(estate)} style={{ backgroundColor: "#35CB6D" }}>Hủy Cọc</button>
                                        </td>
                                    )}
                                    {/* Add more cells with other properties */}
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
