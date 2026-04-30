import React from 'react';

const ProfileCard = ({ developer }) => {
    if (!developer) return null;

    const initials = developer.developer_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {initials}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{developer.developer_name}</h2>
                <div className="flex flex-wrap gap-6">
                    {[
                        { label: 'Team',    value: developer.team_name },
                        { label: 'Manager', value: developer.manager_name },
                        { label: 'Role',    value: developer.service_type },
                        { label: 'Level',   value: developer.level },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</span>
                            <span className="text-sm font-semibold text-gray-700">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
