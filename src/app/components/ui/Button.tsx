import React from 'react';

interface ButtonProps {
  /** correo del usuario a mostrar */
  email: string;
}

/**
 * Componente de botón personalizado con popover usando <details>
 */
export function Button({ email }: ButtonProps) {
  return (
    <details className="relative">
      <summary
        className="
          bg-[#186170] hover:bg-[#186170]/90 text-white font-semibold py-2 px-4 rounded
          cursor-pointer select-none transition-colors duration-200
        "
      >
        {email}
      </summary>
      <ul
        className="
          absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden
          space-y-1 py-1
        "
      >
        <li>
          <a
            href="/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Profile
          </a>
        </li>
        <li>
          <a
            href="/logout"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Logout
          </a>
        </li>
      </ul>
    </details>
  );
}
