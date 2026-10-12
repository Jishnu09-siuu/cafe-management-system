/**
 * HTML Email Templates for Mocha & Miso Craft Café
 */

const CAFE_DETAILS = {
  name: 'Mocha & Miso Café',
  address: '124 Artisan Alley, Craft District',
  phone: '(555) 234-5678',
  mapsLink: 'https://maps.google.com/?q=124+Artisan+Alley+Craft+District',
  logoUrl: 'https://mochaandmiso.web.app/asstes/logo_icon.jpg'
};

function formatTime(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes(':')) return timeStr;
  if (timeStr.length === 4) {
    let hours = parseInt(timeStr.substring(0, 2), 10);
    const mins = timeStr.substring(2);
    const period = hours < 11 ? 'sáng' : hours < 13 ? 'trưa' : hours < 18 ? 'chiều' : 'tối';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${period}`;
  }
  return timeStr;
}

function renderBaseTemplate({ headline, title, message, res, accentColor = '#6F4E37' }) {
  const customerName = res.customerName || res.name || 'Quý khách';
  const resId = res.reservationId || res.id || 'Chưa có';
  const date = res.date || 'Chưa xác định';
  const time = formatTime(res.time);
  const guests = res.guests || 2;
  const phone = res.phone || 'Chưa cung cấp';
  const specialRequests = res.specialRequest || res.notes || 'Không có';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8F5F2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2C221E; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #F8F5F2; padding: 30px 0; }
    .main { background-color: #FFFFFF; margin: 0 auto; max-width: 580px; border-radius: 12px; border: 1px solid #E5DCD3; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.04); }
    .header { background-color: #1C1410; padding: 32px 24px; text-align: center; color: #F8F5F2; }
    .logo { max-width: 64px; height: auto; border-radius: 50%; border: 2px solid #C49A78; }
    .cafe-name { font-size: 20px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 12px; color: #F8F5F2; }
    .headline { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #C49A78; margin-top: 4px; }
    .content { padding: 36px 32px; }
    .title { font-size: 24px; font-weight: 500; color: #1C1410; margin-top: 0; margin-bottom: 12px; }
    .intro { font-size: 15px; line-height: 1.6; color: #5C4F48; margin-bottom: 24px; }
    .details-box { background-color: #FAF7F4; border-radius: 8px; border: 1px solid #EFE8E1; padding: 20px 24px; margin-bottom: 28px; }
    .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #E5DCD3; padding: 10px 0; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #7C6D65; }
    .detail-val { font-weight: 600; color: #1C1410; }
    .badge-code { background: #EFE8E1; padding: 2px 8px; border-radius: 4px; font-family: monospace; letter-spacing: 0.05em; color: #6F4E37; }
    .location-box { background-color: #F4EFEA; border-left: 4px solid ${accentColor}; padding: 16px 20px; border-radius: 4px; margin-bottom: 28px; }
    .location-title { font-weight: 600; font-size: 14px; color: #1C1410; margin-bottom: 4px; }
    .location-text { font-size: 13px; color: #5C4F48; line-height: 1.5; margin: 0; }
    .maps-link { display: inline-block; margin-top: 8px; font-size: 13px; color: #9C5538; font-weight: 600; text-decoration: none; }
    .footer { background-color: #1C1410; padding: 24px; text-align: center; color: #C49A78; font-size: 13px; }
    .footer-main { font-size: 16px; font-weight: 500; color: #F8F5F2; margin-bottom: 8px; font-style: italic; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <img src="${CAFE_DETAILS.logoUrl}" alt="${CAFE_DETAILS.name}" class="logo" />
        <div class="cafe-name">Mocha &amp; Miso</div>
        <div class="headline">${headline}</div>
      </div>
      <div class="content">
        <h2 class="title">${title}</h2>
        <p class="intro">Kính gửi ${customerName},<br/>${message}</p>
        
        <div class="details-box">
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #7C6D65; border-bottom: 1px dashed #E5DCD3;">Mã đặt bàn</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410; border-bottom: 1px dashed #E5DCD3;"><span class="badge-code">${resId}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7C6D65; border-bottom: 1px dashed #E5DCD3;">Tên khách hàng</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410; border-bottom: 1px dashed #E5DCD3;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7C6D65; border-bottom: 1px dashed #E5DCD3;">Ngày</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410; border-bottom: 1px dashed #E5DCD3;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7C6D65; border-bottom: 1px dashed #E5DCD3;">Giờ</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410; border-bottom: 1px dashed #E5DCD3;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7C6D65; border-bottom: 1px dashed #E5DCD3;">Số lượng khách</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410; border-bottom: 1px dashed #E5DCD3;">${guests}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7C6D65; border-bottom: 1px dashed #E5DCD3;">Số điện thoại liên hệ</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410; border-bottom: 1px dashed #E5DCD3;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #7C6D65;">Yêu cầu thêm</td>
              <td align="right" style="padding: 8px 0; font-weight: 600; color: #1C1410;">${specialRequests}</td>
            </tr>
          </table>
        </div>

        <div class="location-box">
          <div class="location-title">Địa chỉ và liên hệ</div>
          <p class="location-text">
            📍 ${CAFE_DETAILS.address}<br/>
            📞 ${CAFE_DETAILS.phone}
          </p>
          <a href="${CAFE_DETAILS.mapsLink}" target="_blank" class="maps-link">Xem trên Google Maps &rarr;</a>
        </div>
      </div>

      <div class="footer">
        <div class="footer-main">Rất mong sớm được đón tiếp bạn.</div>
        <div>&copy; ${new Date().getFullYear()} ${CAFE_DETAILS.name}. Bảo lưu mọi quyền.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template 1: Initial Reservation Created Email
 */
function getInitialConfirmationEmail(res) {
  return {
    subject: `Đã nhận yêu cầu đặt bàn — Mocha & Miso Café (${res.reservationId || res.id || 'Xác nhận'})`,
    html: renderBaseTemplate({
      headline: 'Đặt bàn',
      title: 'Đã nhận yêu cầu đặt bàn',
      message: 'Cảm ơn bạn đã chọn quán. Chúng tôi đã nhận được yêu cầu đặt bàn và rất mong được đón tiếp bạn.',
      res,
      accentColor: '#C49A78'
    })
  };
}

/**
 * Template 2: Reservation Confirmed Email (Requirement 5)
 */
function getConfirmedEmail(res) {
  return {
    subject: 'Đặt bàn của bạn đã được xác nhận',
    html: renderBaseTemplate({
      headline: 'Đặt bàn đã xác nhận',
      title: 'Đặt bàn của bạn đã được xác nhận!',
      message: 'Đặt bàn của bạn đã được xác nhận. Chúng tôi rất mong được đón bạn đến tận hưởng một buổi sáng thong thả và trải nghiệm cà phê thủ công.',
      res,
      accentColor: '#2E7D32'
    })
  };
}

/**
 * Template 3: Reservation Cancelled Email (Requirement 5)
 */
function getCancelledEmail(res) {
  return {
    subject: 'Đặt bàn của bạn đã bị hủy',
    html: renderBaseTemplate({
      headline: 'Cập nhật trạng thái đặt bàn',
      title: 'Đặt bàn đã bị hủy',
      message: 'Yêu cầu đặt bàn tại Mocha & Miso đã bị hủy theo đề nghị của bạn hoặc do tình trạng chỗ ngồi. Vui lòng liên hệ nếu bạn muốn đặt lại.',
      res,
      accentColor: '#D32F2F'
    })
  };
}

module.exports = {
  getInitialConfirmationEmail,
  getConfirmedEmail,
  getCancelledEmail,
  CAFE_DETAILS
};
