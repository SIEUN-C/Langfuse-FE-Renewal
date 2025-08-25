import React, { useEffect } from 'react';
import { X } from 'lucide-react'
import styles from './SidePanel.module.css';

const SidePanel = ({ children, isOpen, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className = { `${ styles.backdrop } ${ isOpen ? styles['backdrop--open'] : ''}` } onClick = { onClose }>
            <div className = { `${ styles.panel } ${ isOpen ? styles['panel--open'] : ''}` } onClick = { (e) => e.stopPropagation() }>
                <div className = { styles.header }>
                    <button onClick = { onClose } className = { styles.closeButton }><X size = { 16 } /></button>
                </div>
                <div className = { styles.body }>
                    { children }
                </div>
            </div>
        </div>
    );
};

export default SidePanel;