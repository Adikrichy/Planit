import CardItem from './Card';
import { Card } from './boardsSlice';
import './List.css';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useCreateCardMutation, useUpdateListMutation } from '../api/apiSlice'; // <-- импортируем useUpdateListMutation
import DeleteIcon from '../../assets/delete.svg';

type Props = {
  id: string;
  board_id: string;
  title: string;
  cards: Card[];
  handleDeleteDialog?: (id: string) => void;
};

const List = ({ board_id, id, title, cards, handleDeleteDialog }: Props) => {
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);

  // Локальные состояния
  const [originalHeight, setOriginalHeight] = useState<string | number>(0);
  const [newCardName, setNewCardName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // Новые состояния для редактирования списка
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const [createCard] = useCreateCardMutation();
  const [updateList] = useUpdateListMutation(); // <-- Мутация для обновления списка

  const {
    node,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'list',
    },
  });

  const style: CSSProperties = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  useEffect(() => {
    if (!isDragging) {
      setOriginalHeight(node.current?.clientHeight || 'auto');
    }
  }, [isDragging, node]);

  if (isDragging) {
    style.height = originalHeight;
    style.opacity = 0.3;
    return <div className="list drag" style={style} ref={setNodeRef}></div>;
  }

  // --- Функция для добавления новой карточки ---
  const handleAddCard = async () => {
    if (!newCardName) return;
    try {
      await createCard({ boardId: board_id, listId: id, title: newCardName });
    } catch (err) {
      console.log(err);
    }
    setNewCardName('');
  };

  // --- Функции для редактирования названия списка ---
  const handleEditClick = () => {
    setIsEditing(true);
    setNewTitle(title); // сбросим поле в текущее название
  };

  const handleSaveTitle = async () => {
    // Если название не изменилось, просто закрываем режим редактирования
    if (!newTitle || newTitle === title) {
      setIsEditing(false);
      return;
    }

    try {
      // Вызываем мутацию для обновления списка
      await updateList({
        boardId: board_id,
        listId: id,
        title: newTitle,
      }).unwrap();
    } catch (err) {
      console.log(err);
    }
    setIsEditing(false);
  };

  // Можно сохранить при потере фокуса или при нажатии Enter
  const handleTitleBlur = () => {
    handleSaveTitle();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    }
  };

  return (
    <div className="list" style={style} ref={setNodeRef}>
      <div className="list-content">
        {/* Заголовок списка */}
        <div className="list-header" {...attributes} {...listeners}>
          {isEditing ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
          ) : (
            <h3 className="list-title">{title}</h3>
          )}

          {/* Кнопка "Edit" (только если не редактируем сейчас) */}
          {!isEditing && (
            <button onClick={handleEditClick}>Edit</button>
          )}

          {/* Кнопка "Delete" */}
          <button
            onClick={handleDeleteDialog ? () => handleDeleteDialog(id) : undefined}
          >
            <img src={DeleteIcon} alt="Delete" />
          </button>
        </div>

        {/* Список карточек */}
        <div className="list-cards">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <CardItem
                key={card.id}
                list_id={id}
                id={card.id}
                title={card.title}
                board_id={board_id}
                pos={card.position}
              />
            ))}
          </SortableContext>

          {/* Кнопка добавления карточки */}
          <button className="add-card-btn" onClick={() => setShowAddInput(true)}>
            {showAddInput && (
              <input
                type="text"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="Name..."
                autoFocus
                onBlur={() => {
                  setNewCardName('');
                  setShowAddInput(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              />
            )}
            {!showAddInput && <>+ Add Card</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default List;
