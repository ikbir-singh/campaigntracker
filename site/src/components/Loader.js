import { ThreeDots } from 'react-loader-spinner';

const Loader = ({ children, title, subtitle }) => {
  return (
    <ThreeDots
      height="80"
      width="80"
      radius="9"
      color="#0d6efd"
      ariaLabel="three-dots-loading"
      wrapperStyle
      wrapperclassName
    />

  );
};

export default Loader;
