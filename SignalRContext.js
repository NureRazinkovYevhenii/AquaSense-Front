import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const SignalRContext = createContext(null);

export function SignalRProvider({ children }) {
  const [connection, setConnection] = useState(null);
  const userIdRef = useRef(null);
  const didRunRef = useRef(false); // Для StrictMode

  useEffect(() => {
    if (didRunRef.current) {
        return; // Предотвращаем двойной запуск в StrictMode
    }
    didRunRef.current = true;

    let currentConnection = null; // Локальная переменная для текущего соединения

    const startSignalRConnection = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('SignalR: No token found.');
        return;
      }

      // Извлечение userId
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.error('SignalR: Invalid token format.'); return;
        }
        const payloadString = atob(tokenParts[1]);
        const payload = JSON.parse(payloadString);
        const nameIdClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
        let extractedUserId = payload[nameIdClaim] || payload.sub;

        if (!extractedUserId) {
            console.error('SignalR: Could not find user ID claim in token.'); return;
        }
        userIdRef.current = extractedUserId;
      } catch (e) {
        console.error('SignalR: Failed to parse token or extract userId:', e); return;
      }

      // !!! УБЕДИТЕСЬ, ЧТО ЭТОТ URL ВЕРНЫЙ !!!
      const connectionUrl = 'http://localhost:8080/aquariumHub';

      currentConnection = new signalR.HubConnectionBuilder()
        .withUrl(connectionUrl)
        .withAutomaticReconnect()
        .build();

      // Обработчики событий соединения
      currentConnection.onreconnecting(error => {
        console.warn('SignalR: Attempting to reconnect...', error); // Оставим предупреждение
        setConnection(null);
      });

      currentConnection.onreconnected(connectionId => {
        // console.log(`SignalR: Reconnected (ID: ${connectionId}).`); // Можно убрать
        setConnection(currentConnection);
        // Повторное присоединение к группе обычно не требуется с AutomaticReconnect
      });

      currentConnection.onclose(error => {
        console.error('SignalR: Connection closed.', error); // Оставим ошибку
        setConnection(null);
      });

      // Запуск соединения
      try {
        await currentConnection.start();
        setConnection(currentConnection); // Устанавливаем соединение в state
        if (userIdRef.current) {
          // Присоединяемся к группе после успешного старта
          await currentConnection.invoke('JoinUserGroup', userIdRef.current);
        }
      } catch (err) {
        console.error('SignalR: Connection failed to start: ', err); // Оставим ошибку
        setConnection(null);
      }
    };

    startSignalRConnection();

    // Функция очистки
    return () => {
      didRunRef.current = false; // Сброс флага для StrictMode
      if (currentConnection) {
          // Останавливаем соединение, созданное в ЭТОМ запуске useEffect
          currentConnection.stop()
              .catch(err => console.error('SignalR: Error stopping connection via cleanup:', err)); // Оставим ошибку
      }
      setConnection(null); // Убираем соединение из state при размонтировании
    };
  }, []); // Пустой массив зависимостей

  return (
    <SignalRContext.Provider value={connection}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  return useContext(SignalRContext);
}