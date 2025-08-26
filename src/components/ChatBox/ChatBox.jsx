import React, { useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './ChatBox.module.css';
import { GripVertical, X, MessageSquarePlus, PlusSquare } from 'lucide-react';

// Draggable 메시지 행 컴포넌트
const ChatMessageRow = ({ msg, index, moveMessage, handleMessageChange, handleRemoveMessage }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: 'message',
        hover(item, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if ((dragIndex < hoverIndex && hoverClientY < hoverMiddleY) || (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)) {
                return;
            }

            moveMessage(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: 'message',
        item: () => ({ id: msg.id, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    
    preview(drop(ref));

    // Placeholder일 경우와 아닐 경우 다른 UI를 렌더링합니다.
    const isPlaceholder = msg.role === 'Placeholder';

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className={styles.messageRow}>
            <div ref={drag} className={styles.dragHandleWrapper}>
                <GripVertical className={styles.dragHandle} size={18} />
            </div>
            <div className={styles.roleCol}>
                {isPlaceholder ? (
                    <span className={styles.placeholderRole}>Placeholder</span>
                ) : (
                    <select className={styles.roleSelect} value={msg.role} onChange={(e) => handleMessageChange(msg.id, 'role', e.target.value)}>
                        <option>System</option>
                        <option>User</option>
                        <option>Assistant</option>
                    </select>
                )}
            </div>
            <div className={styles.inputCol}>
                {isPlaceholder ? (
                     <input
                        className={styles.placeholderInput}
                        placeholder='Enter placeholder name (e.g., "msg_history") here.'
                        value={msg.content}
                        onChange={(e) => handleMessageChange(msg.id, 'content', e.target.value)}
                    />
                ) : (
                    <textarea 
                        className={styles.messageTextarea}
                        placeholder={
                            msg.role === "System"
                                ? "Enter a system message here."
                                : msg.role === "Assistant"
                                    ? "Enter an assistant message here."
                                    : "Enter a user message here."
                        }
                        value={msg.content} 
                        onChange={(e) => handleMessageChange(msg.id, 'content', e.target.value)} 
                        rows={1} 
                    />
                )}
            </div>
            <button className={styles.removeButton} onClick={() => handleRemoveMessage(msg.id)}>
                <X size={16} />
            </button>
        </div>
    );
};


// 메인 ChatBox 컴포넌트
const ChatBox = ({ messages, setMessages }) => {

    // 초기 렌더링 시 기본 메시지 설정 (기존 로직 유지)
    useEffect(() => {
        if (!messages || messages.length === 0) {
            const initRows = [
                {
                    id: Date.now(),
                    role: "System",
                    content: "You are a helpful assistant.",
                },
                {
                    id: Date.now() + 1,
                    role: "User",
                    content: "",
                },
            ];
            setMessages(initRows);
        }
    }, [messages, setMessages]);


    const handleAddMessage = () => {
        // 마지막 메시지 역할을 기준으로 다음 역할을 추천하는 로직 (개선)
        const lastMessage = messages[messages.length - 1];
        const nextRole = (lastMessage && lastMessage.role === 'User') ? 'Assistant' : 'User';
        
        const newMessage = { id: Date.now(), role: nextRole, content: '' };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleAddPlaceholder = () => {
        const newPlaceholder = { id: Date.now(), role: 'Placeholder', content: '' };
        setMessages(prev => [...prev, newPlaceholder]);
    };

    const handleRemoveMessage = (id) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    };

    const handleMessageChange = (id, field, value) => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, [field]: value } : msg
        ));
    };
    
    const moveMessage = (dragIndex, hoverIndex) => {
        const dragMessage = messages[dragIndex];
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages.splice(dragIndex, 1);
            newMessages.splice(hoverIndex, 0, dragMessage);
            return newMessages;
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={styles.chatEditor}>
                {messages && messages.map((msg, index) => (
                    <ChatMessageRow
                        key={msg.id}
                        index={index}
                        msg={msg}
                        moveMessage={moveMessage}
                        handleMessageChange={handleMessageChange}
                        handleRemoveMessage={handleRemoveMessage}
                    />
                ))}
                <div className={styles.chatActions}>
                    <button className={styles.addBtn} onClick={handleAddMessage}>
                        <MessageSquarePlus size={16} /> Message
                    </button>
                    <button className={styles.addBtn} onClick={handleAddPlaceholder}>
                        <PlusSquare size={16} /> Placeholder
                    </button>
                </div>
            </div>
        </DndProvider>
    );
};

export default ChatBox;