import React, { useState, useEffect } from 'react';
import CallApi from '../CallApi';
import CustomerMenu from './customer-menu';
import UserCustomer from '../../list/userCustomer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storage } from "../../firebase/addimage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from 'axios';

export default function Customerdondat() {
  const [realEstates, setRealEstates] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [customerReservation, setCustomerReservation] = useState([]);
  const userLoginBasicInformationDto = JSON.parse(localStorage.getItem('userLoginBasicInformationDto'));
  const customerId = userLoginBasicInformationDto.accountId;

  const [realEstateDetails, setRealEstateDetails] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [infomationInvestor, setInfomationInvestor] = useState(null);

  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [firebaseImageUrls, setFirebaseImageUrls] = useState([]);
  const [dieukien, setdieukien] = useState(null);
  const [dieukien1, setdieukien1] = useState(null);
  const [dieukien2, setdieukien2] = useState(null);
  const [dieukien3, setdieukien3] = useState(null);

  useEffect(() => {
    fetchData();
  }, [customerId]);

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
    const fileRef = ref(storage, `${realEstateDetails.investorId}/Ảnh Hợp đồng của ${userLoginBasicInformationDto.accountId}/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      return '';
    }
  };

  const fetchData = async () => {
    try {
      const callDataReservations = await CallApi.getAllReservations();
      const filteredReservations = callDataReservations.filter(reservation => (reservation.status === 2 || reservation.status === 3) && reservation.customerId === customerId);
      const lastReservation = filteredReservations[filteredReservations.length - 1];

      setCustomerReservation(lastReservation);
      console.log('lastReservation');
      const filteredReservation = filteredReservations.length > 0 ? filteredReservations[0] : null;
      if (filteredReservation) {
        const IdRealEstate = lastReservation.realEstateId;
        const IdAgency = filteredReservation.agencyId;

        const callDataRealEstateData = await CallApi.getAllRealEstate();
        const foundRealEstate = callDataRealEstateData.find(item => item.id === IdRealEstate);
        setRealEstateDetails(foundRealEstate);

        const locationResponse = await CallApi.getAllLocation();
        const foundLocation = locationResponse.find(location => location.id === foundRealEstate.locationId);
        setLocationInfo(foundLocation);

        const callDataAllAccount = await CallApi.getAllAccount();
        const findIdAgency = callDataAllAccount.find(IdCus => IdCus.id === IdAgency);
        setInfomationInvestor(findIdAgency);

        const dat = callDataRealEstateData.find(item => item.id === lastReservation.realEstateId);
        const trongdat = dat.reservationId;
        setdieukien(trongdat === lastReservation.id ? true : false);
        setdieukien1(((dat.firebaseId === "" || dat.firebaseId === null)) ? false : true);
        setdieukien2(((dat.contract === "" || dat.contract === null)) ? false : true);
        setdieukien3(((dat.customerSellContract === "" || dat.customerSellContract === null)) ? true : false);

      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const Guianhcoc = async () => {
    try {
      const imageUrlString = firebaseImageUrls.join(',');
      const data = {
        customerDepositContract: imageUrlString
      };
      console.log('du lieu coc', data);
      const response = await axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/customer/updateDepositContractByCustomerPost/${realEstateDetails.id}`, data);

      if (response.status === 200) {
        toast.success('Image URLs sent successfully to Swagger endpoint');
      } else {
        toast.error('Failed to send image URLs to Swagger endpoint');
      }
      const thongbao = {
        accountId: infomationInvestor.id,
        description: "Khách hàng đã gửi hình ảnh hợp đồng đặt cọc của bất dộng sản " + realEstateDetails.realestateName,
      }
      const thongbaoadmin = {
        accountId: 43,
        description: "Khách hàng đã gửi hình ảnh hợp đồng đặt cọc của bất dộng sản " + realEstateDetails.realestateName,
      }
      CallApi.createNotification(thongbao);
      CallApi.createNotification(thongbaoadmin);
    } catch (error) {
      console.error('Error sending image URLs to Swagger:', error);
      toast.error('An error occurred while sending image URLs to Swagger endpoint');
    }
  };

  const Guihinhmua = async () => {
    try {
      const imageUrlString = firebaseImageUrls.join(',');
      const data = {
        customerSellContract: imageUrlString
      };
      console.log('du lieu ban', data);
      const response = await axios.put(`http://swprealestatev2-001-site1.etempurl.com/api/customer/updateSellContractByCustomerPost/${realEstateDetails.id}`, data);

      if (response.status === 200) {
        toast.success('Image URLs sent successfully to Swagger endpoint');
      } else {
        toast.error('Failed to send image URLs to Swagger endpoint');
      }
      const thongbao = {
        accountId: infomationInvestor.id,
        description: "Khách hàng đã gửi hình ảnh hợp đồng đặt cọc của bất dộng sản " + realEstateDetails.realestateName,
      }
      const thongbaoadmin = {
        accountId: 43,
        description: "Khách hàng đã gửi hình ảnh hợp đồng đặt cọc của bất dộng sản " + realEstateDetails.realestateName,
      }
      CallApi.createNotification(thongbao);
      CallApi.createNotification(thongbaoadmin);
    } catch (error) {
      console.error('Error sending image URLs to Swagger:', error);
      toast.error('An error occurred while sending image URLs to Swagger endpoint');
    }
  };

  useEffect(() => {
    const uploadFiles = async () => {
      if (selectedFiles.length === 0) return;

      const urls = await Promise.all(selectedFiles.map(uploadFileToFirebase));
      setFirebaseImageUrls(urls);
    };

    uploadFiles();
  }, [selectedFiles]);

  return (
    <div className='container'>
      <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <CustomerMenu
        userLoginBasicInformationDto={userLoginBasicInformationDto}
        UserMenu={UserCustomer}
      />
      {((dieukien && (dieukien1 || dieukien2)) && dieukien3) ? (
        <div>
          {infomationInvestor && realEstateDetails && locationInfo ? (
            <div className="real-estate-detail-container">
              <div className='customer-info'>
                <h2 className="title">Thông tin Agency</h2>
                <p><strong>Tên Agency:</strong> {infomationInvestor.username}</p>
                <p><strong>Số Điện Thoại:</strong> {infomationInvestor.phoneNumber}</p>
                <p><strong>Email:</strong> {infomationInvestor.email}</p>
                <p><strong>Địa Chỉ:</strong> {infomationInvestor.address}</p>
              </div>
              <div className='customer-info'>
                <h2 className="title">Thông tin chi tiết bất động sản</h2>
                <p><strong>Tên:</strong> {realEstateDetails.realestateName}</p>
                <p><strong>Địa chỉ:</strong> {realEstateDetails.address}</p>
                <p><strong>Chiều dài:</strong> {realEstateDetails.length}m</p>
                <p><strong>Chiều rộng:</strong> {realEstateDetails.width}m</p>
                <p><strong>Diện tích:</strong> {realEstateDetails.area} m²</p>
                <p><strong>Giá:</strong> {realEstateDetails.price} VND</p>
                <p><strong>Số phòng:</strong> {realEstateDetails.roomNumber}</p>
                <p><strong>Tỉnh/Thành phố:</strong> {locationInfo.city}</p>
                <p><strong>Quận:</strong> {locationInfo.district}</p>
                <p><strong>Phường:</strong> {locationInfo.ward}</p>
                <p><strong>Mô tả:</strong> {realEstateDetails.discription}</p>
              </div>
              <div className='customer-info' style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <h2 className="title">Ảnh chi tiết Villa</h2>
                {realEstateDetails.realEstateImages.map((image) => (
                  <img
                    key={image.id}
                    src={image.imageUrl}
                    alt={image.imageName}
                    className="sub-image"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p style={{ marginTop: '10px' }}>Chưa có thông tin</p>
          )}
          {realEstateDetails ? (
            <div>
              <input type="file" onChange={handleFileChange} multiple />
              {filePreviews.map((file, index) => (
                <div key={index}>
                  <p>{file.name}</p>
                  {file.src && <img src={file.src} alt="File preview" style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }} />}
                </div>
              ))}
              {realEstateDetails.status === 4 ? (<button onClick={Guianhcoc}>Gửi hình đặt cọc</button>) : (<button onClick={Guihinhmua}>Gửi hình mua</button>)}


            </div>
          ) : (
            <div>
              <span>Không có dữ liệu</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Không có dữ liệu</h2>
        </div>
      )}
    </div>
  );

}
