// src/components/common/AvatarBubble.jsx
export default function AvatarBubble({ username }) {

    const letter = username?.charAt(0)?.toUpperCase() || "E";

    return (
        <div className="avatar-bubble">
            {letter}
        </div>
    );
}

