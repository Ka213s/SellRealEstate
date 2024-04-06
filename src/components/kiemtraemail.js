import React, { useState, useEffect } from 'react';

export default function Testemail() {
  const [redirectMessage, setRedirectMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      // Thá»±c hiá»n chuyá»n hÆ°á»ng sau 10 giÃ¢y
      window.location.href = 'https://vietvillasfpt.vercel.app/dangnhap'; // Thay Äá»i URL cáº§n chuyá»n Äáº¿n
    }, 5000); // 10 giÃ¢y

    // XÃ³a bá» Äáº¿m ngÆ°á»£c náº¿u component bá» unmounted trÆ°á»c khi háº¿t thá»i gian
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setRedirectMessage("Bạn sẽ được chuyển vào trang đang nhập sau 5 giấy");
  }, []);

  return (
    <div style={{ textAlign: 'center', color: 'red' }}>
      <p>Bạn đã đăng kí thành công</p>
      <p>{redirectMessage}</p>
    </div>
  );
}
