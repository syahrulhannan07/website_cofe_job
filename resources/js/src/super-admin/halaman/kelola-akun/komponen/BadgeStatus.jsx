import React from 'react';

const BadgeStatus = ({ status }) => {
    const styles = {
        Aktif:    { bg: '#DBFEE5', text: '#519564' },
        Nonaktif: { bg: '#FEDBDB', text: '#C76A6A' },
    };
    const s = styles[status] || { bg: '#EAE4DC', text: '#4B2E2B' };
    return (
        <span
            className="inline-flex items-center justify-center rounded-[50px]"
            style={{
                width: '84px',
                height: '27px',
                background: s.bg,
                color: s.text,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: '20px',
            }}
        >
            {status}
        </span>
    );
};

export default BadgeStatus;
