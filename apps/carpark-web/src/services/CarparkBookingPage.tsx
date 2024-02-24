import Root from '../root.component';

export function LogOutUser(props: any) {
  localStorage.setItem('currentUsername', '');
  localStorage.setItem('currentName', '');
  localStorage.setItem('currentSurname', '');
  props.onFormSwitch('login');
}
