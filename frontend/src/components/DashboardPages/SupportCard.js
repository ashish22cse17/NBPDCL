import React from 'react';
import './SupportCard.css';

const SupportCard = () => {
  return (
    <div className="support-card">
      <h2>Need Help? Contact NBPDCL Support</h2>
      <div className="support-info">
        <p><strong>📞 Phone:</strong> +91-06152-123456</p>
        <p><strong>📧 Email:</strong> support@nbpdcl.in</p>
        <p><strong>🏢 Address:</strong>  
          North Bihar Power Distribution Company Ltd.<br />
          Vidyut Bhawan, Bailey Road,<br />
          Patna - 800001, Bihar
        </p>
        <p><strong>🕐 Working Hours:</strong> 10:00 AM – 6:00 PM (Mon to Sat)</p>
      </div>
    </div>
  );
};

export default SupportCard;
