import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import notificationService from "../../services/notificationService";

const Notifications = () => {
  const { currentUser, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications(token, {
        limit: 5,
        read: false,
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleClose = async (id) => {
    try {
      await notificationService.markAsRead(token, id);
      setNotifications(
        notifications.filter((notification) => notification.id !== id),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (!currentUser || notifications.length === 0) {
    return null;
  }

  return (
    <ToastContainer
      className="position-fixed"
      position="top-end"
      style={{ zIndex: 1060, top: "70px", right: "20px" }}
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          onClose={() => handleClose(notification.id)}
          show={show}
          delay={8000}
          autohide
        >
          <Toast.Header>
            <i className="bi bi-bell me-2"></i>
            <strong className="me-auto">{notification.title}</strong>
            <small>
              {new Date(notification.createdAt).toLocaleTimeString()}
            </small>
          </Toast.Header>
          <Toast.Body>{notification.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default Notifications;
