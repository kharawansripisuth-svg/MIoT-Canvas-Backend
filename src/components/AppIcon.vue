<script>
const icons = {
  'dashboard': {
    viewBox: '0 0 18 18',
    content: '<path d="M7.25 2H2V7.25H7.25V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 2H10.25V7.25H15.5V2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.25 10.25H2V15.5H7.25V10.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 10.25H10.25V15.5H15.5V10.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'device': {
    viewBox: '0 0 18 18',
    content: '<path d="M12 5.625V3.375C12 2.97718 11.842 2.59564 11.5607 2.31434C11.2794 2.03304 10.8978 1.875 10.5 1.875H7.5C7.10218 1.875 6.72064 2.03304 6.43934 2.31434C6.15804 2.59564 6 2.97718 6 3.375V5.625" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 5.625H3C2.17157 5.625 1.5 6.29657 1.5 7.125V14.625C1.5 15.4534 2.17157 16.125 3 16.125H15C15.8284 16.125 16.5 15.4534 16.5 14.625V7.125C16.5 6.29657 15.8284 5.625 15 5.625Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9V9.0075" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'logo1': {
    viewBox: '0 0 72 72',
    content: '<path d="M12 20C12 13.3726 17.3726 8 24 8H48C54.6274 8 60 13.3726 60 20V44C60 50.6274 54.6274 56 48 56H24C17.3726 56 12 50.6274 12 44V20Z" fill="url(#gradient1)"/><path d="M36 18.6667L22.6666 25.3334L36 32.0001L49.3333 25.3334L36 18.6667Z" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.6666 38.6667L36 45.3334L49.3333 38.6667" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.6666 32L36 38.6667L49.3333 32" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="gradient1" x1="12" y1="8" x2="60" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#1677FF"/><stop offset="1" stop-color="#0958D9"/></linearGradient></defs>'
  },
  'logo2': {
    viewBox: '0 0 64 64',
    content: '<path d="M12 16C12 11.5817 15.5817 8 20 8H44C48.4183 8 52 11.5817 52 16V40C52 44.4183 48.4183 48 44 48H20C15.5817 48 12 44.4183 12 40V16Z" fill="url(#gradient2)"/><path d="M32 18L22 23L32 28L42 23L32 18Z" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 33L32 38L42 33" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 28L32 33L42 28" stroke="currentColor" stroke-width="1.83333" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="gradient2" x1="12" y1="8" x2="52" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#1677FF"/><stop offset="1" stop-color="#0958D9"/></linearGradient></defs>'
  },
  'logs': {
    viewBox: '0 0 18 18',
    content: '<path d="M9 15H15.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.375 2.62493C12.6734 2.32656 13.078 2.15894 13.5 2.15894C13.7089 2.15894 13.9158 2.20009 14.1088 2.28004C14.3019 2.36 14.4773 2.47719 14.625 2.62493C14.7727 2.77266 14.8899 2.94805 14.9699 3.14108C15.0498 3.33411 15.091 3.54099 15.091 3.74993C15.091 3.95886 15.0498 4.16574 14.9699 4.35877C14.8899 4.5518 14.7727 4.72719 14.625 4.87493L5.25 14.2499L2.25 14.9999L3 11.9999L12.375 2.62493Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'member': {
    viewBox: '0 0 18 18',
    content: '<path d="M12.75 15.75V14.25C12.75 13.4544 12.4339 12.6913 11.8713 12.1287C11.3087 11.5661 10.5456 11.25 9.75 11.25H3.75C2.95435 11.25 2.19129 11.5661 1.62868 12.1287C1.06607 12.6913 0.75 13.4544 0.75 14.25V15.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.75 8.25C8.40685 8.25 9.75 6.90685 9.75 5.25C9.75 3.59315 8.40685 2.25 6.75 2.25C5.09315 2.25 3.75 3.59315 3.75 5.25C3.75 6.90685 5.09315 8.25 6.75 8.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.25 15.7499V14.2499C17.2495 13.5852 17.0283 12.9395 16.621 12.4141C16.2138 11.8888 15.6436 11.5136 15 11.3474" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2.34741C12.6453 2.51264 13.2173 2.88794 13.6257 3.41414C14.0342 3.94035 14.2559 4.58753 14.2559 5.25366C14.2559 5.91979 14.0342 6.56697 13.6257 7.09318C13.2173 7.61939 12.6453 7.99469 12 8.15991" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'report': {
    viewBox: '0 0 18 18',
    content: '<path d="M10.5 1.5H4.5C4.10218 1.5 3.72064 1.65804 3.43934 1.93934C3.15804 2.22064 3 2.60218 3 3V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V6L10.5 1.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 1.5V6H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9.75H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.75H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 6.75H6.75H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'rules': {
    viewBox: '0 0 21 20',
    content: '<path d="M6.87683 4.7L5.00183 5.75L6.05183 3.875L5.00183 2L6.87683 3.05L8.75183 2L7.70183 3.875L8.75183 5.75L6.87683 4.7ZM15.8768 12.05L17.7518 11L16.7018 12.875L17.7518 14.75L15.8768 13.7L14.0018 14.75L15.0518 12.875L14.0018 11L15.8768 12.05ZM17.7518 2L15.8768 3.05L14.0018 2L15.0518 3.875L14.0018 5.75L15.8768 4.7L17.7518 5.75L16.7018 3.875L17.7518 2ZM12.0293 5.9675C11.9599 5.89797 11.8775 5.84281 11.7868 5.80518C11.6961 5.76754 11.5988 5.74817 11.5006 5.74817C11.4024 5.74817 11.3051 5.76754 11.2144 5.80518C11.1236 5.84281 11.0412 5.89797 10.9718 5.9675L2.21933 14.72C2.14981 14.7894 2.09464 14.8718 2.05701 14.9625C2.01937 15.0533 2 15.1505 2 15.2488C2 15.347 2.01937 15.4442 2.05701 15.535C2.09464 15.6257 2.14981 15.7081 2.21933 15.7775L3.97433 17.5325C4.26683 17.825 4.73933 17.825 5.03183 17.5325L13.7768 8.7875C13.8464 8.71811 13.9015 8.6357 13.9392 8.54497C13.9768 8.45424 13.9962 8.35698 13.9962 8.25875C13.9962 8.16052 13.9768 8.06326 13.9392 7.97253C13.9015 7.8818 13.8464 7.79939 13.7768 7.73L12.0293 5.9675ZM5.03183 14.72L3.97433 13.6625L10.6043 7.0325L11.6618 8.09L5.03183 14.72Z" fill="currentColor"/>'
  },
  'summary': {
    viewBox: '0 0 20 20',
    content: '<path d="M16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0ZM6 14H4V7H6V14ZM10 14H8V4H10V14ZM14 14H12V10H14V14Z" fill="currentColor"/>'
  },
  'zone': {
    viewBox: '0 0 18 18',
    content: '<path d="M15.75 7.5C15.75 12.75 9 17.25 9 17.25C9 17.25 2.25 12.75 2.25 7.5C2.25 5.70979 2.96116 3.9929 4.22703 2.72703C5.4929 1.46116 7.20979 0.75 9 0.75C10.7902 0.75 12.5071 1.46116 13.773 2.72703C15.0388 3.9929 15.75 5.70979 15.75 7.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'grid': {
    viewBox: '0 0 21 21',
    content: '<path d="M5.25 1.25V19.25M15.25 1.25V19.25M19.25 5.25H1.25M19.25 15.25H1.25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'list': {
    viewBox: '0 0 19 18',
    content: '<path d="M4.82065 4.75V1.75H18.125V4.75H4.82065ZM4.82065 10.75V7.74999H18.125V10.75H4.82065ZM4.82065 16.75V13.75H18.125V16.75H4.82065ZM1.69022 4.75C1.24674 4.75 0.875266 4.606 0.575788 4.318C0.27631 4.03 0.126049 3.674 0.125005 3.25C0.123962 2.826 0.274223 2.47 0.575788 2.182C0.877353 1.894 1.24883 1.75 1.69022 1.75C2.13161 1.75 2.50361 1.894 2.80622 2.182C3.10883 2.47 3.25857 2.826 3.25544 3.25C3.25231 3.674 3.10205 4.0305 2.80466 4.3195C2.50727 4.6085 2.13579 4.752 1.69022 4.75ZM1.69022 10.75C1.24674 10.75 0.875266 10.606 0.575788 10.318C0.27631 10.03 0.126049 9.67399 0.125005 9.24999C0.123962 8.82599 0.274223 8.46999 0.575788 8.18199C0.877353 7.89399 1.24883 7.74999 1.69022 7.74999C2.13161 7.74999 2.50361 7.89399 2.80622 8.18199C3.10883 8.46999 3.25857 8.82599 3.25544 9.24999C3.25231 9.67399 3.10205 10.0305 2.80466 10.3195C2.50727 10.6085 2.13579 10.752 1.69022 10.75ZM1.69022 16.75C1.24674 16.75 0.875266 16.606 0.575788 16.318C0.27631 16.03 0.126049 15.674 0.125005 15.25C0.123962 14.826 0.274223 14.47 0.575788 14.182C0.877353 13.894 1.24883 13.75 1.69022 13.75C2.13161 13.75 2.50361 13.894 2.80622 14.182C3.10883 14.47 3.25857 14.826 3.25544 15.25C3.25231 15.674 3.10205 16.0305 2.80466 16.3195C2.50727 16.6085 2.13579 16.752 1.69022 16.75Z" fill="currentColor"/>'
  },
  'map': {
    viewBox: '0 0 19 20',
    content: '<path d="M11.35 17.8986L5.99999 15.9972L1.35 17.8225C1.18333 17.8901 1.02066 17.9114 0.861998 17.8864C0.703332 17.8614 0.557666 17.8063 0.424999 17.7211C0.292333 17.6359 0.188333 17.522 0.113 17.3794C0.0376665 17.2367 0 17.0718 0 16.8845V2.66197C0 2.44225 0.0626665 2.24789 0.188 2.07887C0.313333 1.90986 0.483999 1.7831 0.699999 1.69859L5.34999 0.101408C5.44999 0.0676055 5.55432 0.0422536 5.66299 0.0253522C5.77166 0.0084508 5.88399 0 5.99999 0C6.11599 0 6.22865 0.0084508 6.33799 0.0253522C6.44732 0.0422536 6.55132 0.0676055 6.64999 0.101408L12 2.00282L16.65 0.177465C16.8166 0.109859 16.9793 0.0889013 17.138 0.114591C17.2966 0.140282 17.4423 0.195042 17.575 0.278873C17.7076 0.362704 17.812 0.476958 17.888 0.621634C17.964 0.76631 18.0013 0.930929 18 1.11549V15.338C18 15.5577 17.9376 15.7521 17.813 15.9211C17.6883 16.0901 17.5173 16.2169 17.3 16.3014L12.65 17.8986C12.55 17.9324 12.446 17.9577 12.338 17.9746C12.23 17.9915 12.1173 18 12 18C11.8826 18 11.7703 17.9915 11.663 17.9746C11.5556 17.9577 11.4513 17.9324 11.35 17.8986ZM11 15.6423V3.77746L6.99999 2.35775V14.2225L11 15.6423ZM13 15.6423L16 14.6282V2.61127L13 3.77746V15.6423ZM2 15.3887L4.99999 14.2225V2.35775L2 3.37183V15.3887Z" fill="currentColor"/>'
  },
  'notification': {
    viewBox: '0 0 18 20',
    content: '<path d="M10.3 16C10.1685 16.2285 9.97906 16.4183 9.75083 16.5502C9.52261 16.6822 9.26363 16.7517 9 16.7517C8.73637 16.7517 8.47739 16.6822 8.24917 16.5502C8.02094 16.4183 7.83152 16.2285 7.7 16M13.5 7.5C13.5 6.30653 13.0259 5.16193 12.182 4.31802C11.3381 3.47411 10.1935 3 9 3C7.80653 3 6.66193 3.47411 5.81802 4.31802C4.97411 5.16193 4.5 6.30653 4.5 7.5C4.5 12.5 2.5 14 2.5 14H15.5C15.5 14 13.5 12.5 13.5 7.5Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14.5" cy="3.89282" r="3.5" fill="#FF4D4F"/>'
  },
  'out': {
    viewBox: '0 0 18 18',
    content: '<path d="M6 2.07153H4C3.46957 2.07153 2.96086 2.28225 2.58579 2.65732C2.21071 3.03239 2 3.5411 2 4.07153V12.0715C2 12.602 2.21071 13.1107 2.58579 13.4857C2.96086 13.8608 3.46957 14.0715 4 14.0715H6M10.5 11.5715L14 8.07153M14 8.07153L10.5 4.57153M14 8.07153H6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'sun': {
    viewBox: '0 0 18 21',
    content: '<path d="M9 12.75C10.3807 12.75 11.5 11.6307 11.5 10.25C11.5 8.86929 10.3807 7.75 9 7.75C7.61929 7.75 6.5 8.86929 6.5 10.25C6.5 11.6307 7.61929 12.75 9 12.75Z" stroke="currentColor" stroke-width="1.3"/><path d="M9 2.75V4.75M9 15.75V17.75M1.5 10.25H3.5M14.5 10.25H16.5M3.7 4.95L5.1 6.35M12.9 14.15L14.3 15.55M3.7 15.55L5.1 14.15M12.9 6.35L14.3 4.95" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'
  },
  // === Icons สำหรับ Login Page ===
  'user': {
    viewBox: '0 0 24 24',
    content: '<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'lock': {
    viewBox: '0 0 24 24',
    content: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'eye': {
    viewBox: '0 0 24 24',
    content: '<path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'eye-off': {
    viewBox: '0 0 24 24',
    content: '<path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 1L23 23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'alert-circle': {
    viewBox: '0 0 24 24',
    content: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'logo': {
    viewBox: '0 0 24 24',
    content: '<path d="M2 8C2 5.79086 3.79086 4 6 4H18C20.2091 4 22 5.79086 22 8V16C22 18.2091 20.2091 20 18 20H6C3.79086 20 2 18.2091 2 16V8Z" fill="url(#logoGrad)"/><path d="M12 7.5L6.5 10.5L12 13.5L17.5 10.5L12 7.5Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 13.5L12 16.5L17.5 13.5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="logoGrad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse"><stop stop-color="#1677FF"/><stop offset="1" stop-color="#0958D9"/></linearGradient></defs>'
  },
  'logo-white': {
    viewBox: '0 0 22 22',
    content: '<path d="M11 3L4 7L11 11L18 7L11 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 11L11 15L18 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15L11 19L18 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'arrow-left': {
    viewBox: '0 0 24 24',
    content: '<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'mail': {
    viewBox: '0 0 24 24',
    content: '<path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'check': {
    viewBox: '0 0 24 24',
    content: '<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'shield-check': {
    viewBox: '0 0 24 24',
    content: '<path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  },
  'key-round': {
    viewBox: '0 0 24 24',
    content: '<path d="M2 18V22H6L12 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 22L7.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>'
  },
  'chevron-down': {
	viewBox: '0 0 24 24',
	content: '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" stroke="currentColor" stroke-width="3"/>'
	},
  'funnel': {
	viewBox: '0 0 24 24',
	content: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" stroke="currentColor" stroke-width="2"/>'
  },
  'plus': {
	viewBox: '0 0 24 24',
	content: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" stroke-width="2"/>'
  },
  'magnifying-glass': {
	viewBox: '0 0 24 24',
	content: '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" stroke-width="2"/>'
  },
//   stroke="currentColor" stroke-width="1.5"

}
</script>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => value in icons
  },
  size: { type: [String, Number], default: 18 },
  color: { type: String, default: 'currentColor' }
})

const iconData = computed(() => icons[props.name])
const iconStyle = computed(() => ({ color: props.color }))
</script>

<template>
  <svg
    v-if="iconData"
    :viewBox="iconData.viewBox"
    :width="size"
    :height="size"
    :style="iconStyle"
    class="inline-block shrink-0"
    fill="none"
    v-html="iconData.content"
  ></svg>
</template>
