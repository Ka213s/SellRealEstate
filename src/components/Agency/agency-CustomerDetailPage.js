import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { storage } from "../../firebase/addimage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CallApi from '../CallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AgencyMenu from './agency-menu';
import UserAgency from '../../list/userAgency';
import { set } from 'date-fns';

export default function AgencyCustomerDetailPage() {
    const { customerId, realEstateId } = useParams();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [locationId, setlocationId] = useState(null);
    const [seturlimg, setseturlimg] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [filterRealEstate, setFilterRealEstate] = useState(null);
    const [filePreviews, setFilePreviews] = useState([]);
    const [getIdAccount, setGetIdAccount] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [status3, setStatus3] = useState(false);
    const [sold, setSold] = useState(false);
    const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
    const [ResvervationId, setResvervationId] = useState(null);
    const [AllReservation, setAllReservation] = useState([]);
    const [dieukien, setdieukien] = useState(null);
    useEffect(() => {
        const fetchRealEstate = async () => {
            try {
                const allRealEstateResponse = await CallApi.getAllRealEstate();
                const foundRealEstate = allRealEstateResponse.find(re => re.id === parseInt(realEstateId));
                setFilterRealEstate(foundRealEstate);
                const locationResponse = await CallApi.getAllLocation();
                const foundLocation = locationResponse.find(location => location.id === foundRealEstate.locationId);
                setlocationId(foundLocation);
                const getAllAccount = await CallApi.getAllAccount();
                const foundIdAccount = getAllAccount.find(resId => resId.id === parseInt(customerId));
                setGetIdAccount(foundIdAccount);
                console.log("x", foundLocation);
                setStatus3(foundRealEstate.status === 3 || foundRealEstate.status === 4);
                setSold(foundRealEstate.status === 5 || foundRealEstate.status === 6);
                const getAllReservations = await CallApi.getAllReservations();
                setAllReservation(getAllReservations);
                const filteredReservations = getAllReservations.filter(reservation => reservation.customerId === parseInt(customerId));
                const lastReservation = filteredReservations[filteredReservations.length - 1];
                setResvervationId(lastReservation.id);
                console.log("fillterResver", lastReservation);
                console.log("????", foundRealEstate.reservationId);
                console.log("!!!", lastReservation.id);
                setdieukien(foundRealEstate.reservationId === lastReservation.id);
            //     const fillternhungthangkco = AllReservation.filter(reservation => reservation.realEstateId === parseInt(realEstateId));
            //     const fillterX = fillternhungthangkco.filter(reservation => reservation.customerId !== parseInt(customerId));
                
            //     // Extract unique customerIds from fillterX array using a Set
            //     const uniqueCustomerIds = new Set(fillterX.map(reservation => reservation.customerId));
                
            //     // Convert the Set back to an array if needed
            //     const customerIds = Array.from(uniqueCustomerIds);
                
            // console.log("customerIds", customerIds);
            } catch (error) {
                console.error('Error fetching real estate data:', error);
            }
        };
        fetchRealEstate();
    }, [realEstateId, customerId]);

    useEffect(() => {
        setFilePreviews(selectedFiles.map(file => {
            const src = URL.createObjectURL(file);
            return { name: file.name, src: src };
        }));
    }, [selectedFiles]);

    const handleFileChange = async (event) => {
        const files = event.target.files;
        const newFiles = Array.from(files);
        setUploadingFiles(true);
        setSelectedFiles(newFiles);
        setUploadingFiles(false);
    };

    const uploadFileToFirebase = async (file) => {
        const fileRef = ref(storage, `uploadedFiles/${userLoginBasicInformationDto.accountId}/${file.name}`);
        try {
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            console.log(`File uploaded successfully: ${url}`);
            return url; // Return the URL for this file
        } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            return ''; // Return an empty string if there was an error
        }
    };

    const markAsDeposit = async () => {
        try {
            if (selectedFiles.length === 0) {
                toast.error('Vui lòng chọn ít nhất một ảnh trước khi gửi.');
                return;
            }
            const firebaseUrls = await Promise.all(selectedFiles.map(uploadFileToFirebase));
            const requestData = {
                firebaseId: firebaseUrls.join(),
                reservationId: ResvervationId,
                status: 4,
            };

            console.log('Sending data to Swagger:', requestData);
            axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/agency/updatePostById/${realEstateId}`, requestData)
                .then(response => {
                    console.log('Response from Swagger:', response.data);
                    toast.success('Đã đặt cọc thành công!');
                    setSelectedFiles([]);
                    setseturlimg(null);
                })
                .catch(error => {
                    console.error('Error sending data to Swagger:', error);
                });
            const thongbao = {
                accountId: customerId,
                description: `Vui lòng đăng ảnh đặt cọc bạn đã chụp của bất động sản ${filterRealEstate.realestateName}.`
            }
            const thongbaoadmin = {
                accountId: 43,
                description: `Vui lòng xác thực ảnh Acgency đã đăng cọc bất động sản ${filterRealEstate.realestateName}.`
            }
            CallApi.createNotification(thongbao);
            CallApi.createNotification(thongbaoadmin);
            const fillternhungthangkco = AllReservation.filter(reservation => reservation.realEstateId === parseInt(realEstateId));
            const fillterX = fillternhungthangkco.filter(reservation => reservation.customerId !== parseInt(customerId));
            
            // Extract unique customerIds from fillterX array using a Set
            const uniqueCustomerIds = new Set(fillterX.map(reservation => reservation.customerId));
            
            // Convert the Set back to an array if needed
            const customerIds = Array.from(uniqueCustomerIds);
            
            customerIds.forEach(customerId => {
                const thongbaoall = {
                    accountId: customerId, // Change accountId to accountIds to represent multiple ids
                    description: `Bất động sản ${filterRealEstate.realestateName} đã được người khác đặt cọc.`
                }
                console.log("thongbaoall", thongbaoall);
                CallApi.createNotification(thongbaoall);
            });

        
           
        } catch (error) {
            console.error('Error uploading files to Firebase:', error);
        }
    };
    const markAsSold = async () => {
        try {
            if (selectedFiles.length === 0) {
                toast.error('Vui lòng chọn ít nhất một ảnh trước khi gửi.');
                return;
            }
            const firebaseUrls = await Promise.all(selectedFiles.map(uploadFileToFirebase));
            const requestData = {
                contract: firebaseUrls.join(),
                reservationId: ResvervationId,
                status: 6,
            };
            console.log('Sending data to Swagger:', requestData);
            // Send data to Swagger
            axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/agency/updateRealEstateContractByRealEstateId/${realEstateId}`, requestData)
                .then(response => {
                    console.log('Response from Swagger:', response.data);
                    toast.success('Đã đặt bán thành công!');
                    setSelectedFiles([]);
                    setseturlimg(null);
                })
                .catch(error => {
                    console.error('Error sending data to Swagger:', error);
                });
            const thongbao = {
                accountId: customerId,
                description: `Vui lòng đăng ảnh bán bạn đã chụp của bất động sản ${filterRealEstate.realestateName}.`
            }
            const thongbaoadmin = {
                accountId: 43,
                description: `Vui lòng xác thực ảnh Acgency đã đăng bán bất động sản ${filterRealEstate.realestateName}.`
            }
            CallApi.createNotification(thongbao);
            CallApi.createNotification(thongbaoadmin);
        } catch (error) {
            console.error('Error uploading files to Firebase:', error);
        }
    };


    return (
        <div className="admin-all-account">
            <div className='agency-menu'>
                <AgencyMenu
                    userLoginBasicInformationDto={userLoginBasicInformationDto}
                    UserMenu={UserAgency}
                />
            </div>
            <div className='box-allaccount'>
                <h1>Thông Tin Bất Động Sản Và Khách Hàng Đặt Cọc</h1>
                <ToastContainer /> {/* Component for toast messages */}
                <div className='customer-info'>
                    {/* Display real estate and customer information */}
                    {filterRealEstate && (
                        <div>
                            <h2>Thông tin bất động sản</h2>
                            <p>Tên: {filterRealEstate.realestateName}</p>
                            <p>Địa chỉ: {filterRealEstate.address}</p>
                            <p>Số phòng: {filterRealEstate.roomNumber}</p>
                            <p>Chiều dài: {filterRealEstate.length}</p>
                            <p>Chiều rộng: {filterRealEstate.width}</p>
                            <p>Diện tích: {filterRealEstate.area}</p>
                            <p>Giá: {filterRealEstate.price}</p>
                            {/* <p>Tỉnh: {locationId.city}</p>
                            <p>Quận: {locationId.district}</p>
                            <p>Phường: {locationId.ward}</p> */}
                        </div>
                    )}
                </div>
                <div className='customer-info'>
                    {getIdAccount && (
                        <div>
                            <h2>Thông tin khách hàng</h2>
                            <p>Tên khách hàng: {getIdAccount.username}</p>
                            <p>Số điện thoại : {getIdAccount.phoneNumber}</p>
                            <p>Email : {getIdAccount.email}</p>
                        </div>
                    )}
                </div>
                {dieukien ? (
                    <div>
                        <div className='customer-info' style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                            {/* Image upload section */}

                            {sold ? (
                                <div>
                                    <h1>Hợp đồng bán</h1>
                                    {filterRealEstate && filterRealEstate.contract && (
                                        <img src={filterRealEstate.contract} alt="Firebase Image" style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }} />
                                    )}
                                    <div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {status3 && (
                                        <div>
                                            <h1>Hợp đồng cọc</h1>
                                            {filterRealEstate && filterRealEstate.firebaseId && (
                                                <img src={filterRealEstate.firebaseId} alt="Firebase Image" />
                                            )}
                                        </div>
                                    )}
                                    {uploadingFiles ? (
                                        <div>Loading...</div>
                                    ) : (
                                        <div>
                                            <input type="file" onChange={handleFileChange} multiple />
                                            <div>
                                                {filePreviews.map((file, index) => (
                                                    <div key={index}>
                                                        <p>{file.name}</p>
                                                        {file.src && <img src={file.src} alt="File preview" style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Conditionally render buttons */}
                        <div style={{ textAlign: 'center' }}>
                            {!status3 && !sold && selectedFiles.length > 0 && <button onClick={markAsDeposit} className="approve-button">Khách hàng chọn cọc</button>}
                            {!sold && !sold && selectedFiles.length > 0 && <button onClick={markAsSold} className="approve-button">Khách hàng chọn bán</button>}
                        </div>
                    </div>) : (
                    <p></p>
                )}

            </div>
        </div>
    );
}
