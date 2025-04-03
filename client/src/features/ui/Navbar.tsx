import { Link } from 'react-router-dom';
import LogoLight from '../../assets/logo.svg'; // Белый цвет
 
import './Navbar.css';

const Navbar = ({ theme }: { theme: 'light' | 'dark' }) => {
  const logo = theme === 'light' ? LogoLight : LogoLight; // Выбираем логотип в зависимости от темы

  return (
    <nav className="nav-no-auth">
      <div className="nav-content-wrapper">
        <div className="nav-content">
          <img className="logo" src={logo} alt="Logo" />
          <Link to="/login" className="btn-line">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;