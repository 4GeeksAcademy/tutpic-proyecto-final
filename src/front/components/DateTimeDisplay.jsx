import React, { useState, useEffect } from "react";

export const DateTimeDisplay = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const fetchTimeFromAPI = async () => {
            try {
                const response = await fetch('https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires');
                const data = await response.json();

                if (response.ok && data.datetime) {
                    setDateTime(new Date(data.datetime));
                    setIsOnline(true);
                }
            } catch (error) {
                console.error('Error al obtener la hora de la API:', error);
                setIsOnline(false);
            }
        };

        fetchTimeFromAPI();

        const intervalId = setInterval(() => {
            setDateTime(prevDateTime => new Date(prevDateTime.getTime() + 1000));
        }, 1000);

        const apiIntervalId = setInterval(fetchTimeFromAPI, 60000);

        return () => {
            clearInterval(intervalId);
            clearInterval(apiIntervalId);
        };
    }, []);

    const formatDate = (date) => {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const dayName = days[date.getDay()];
        const day = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${day} de ${monthName} de ${year}`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                {formatDate(dateTime)}
            </div>
            <div style={{ fontSize: '20px', letterSpacing: '1px' }}>
                {formatTime(dateTime)}
            </div>
            {!isOnline && (
                <div style={{
                    fontSize: '10px',
                    color: '#ffc107',
                    marginTop: '4px'
                }}>
                    (Hora local)
                </div>
            )}
        </div>
    );
};
