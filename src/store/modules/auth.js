import {
  UsersService
} from '@/services/users.service';
import {
  AuthService
} from '@/services/auth.service';

const buildMenu = ({
    routes,
    rolesUser
  }) => {

    // eslint-disable-next-line no-debugger
    debugger
    const listWithPermisse = routes.filter((route) =>
      (!route.hidden && ( route.meta.roles.includes("*") ||
        route.meta.roles.find(obj => rolesUser.includes(obj))))); /**remove todos menus sem permissão  */

    let list = [];
    /**tranforma o filhos em munu principal de acordo com regra hasSubMenu */
    listWithPermisse.map((item)=>{
      if (Boolean(item.children) && /**tem ter filho */
        item.children.length && /**tem ter filho */
        !item.meta.hasSubMenu) { 
        list = [...list, ...item.children]
      } else { 
        list = [...list, item]
      } 
    });
    return list;
  }
   
    export default {
      namespaced: true,
      state: {
        routes: [],
        user: {
          id: '',
          roles: [],
          name: '',
          email: '',
          token: '',
        }
      },
      getters: {
        //permissionRoutes : (state)=> hasPermission(state.routes, state.role), /**verifica usuario tem acesso ao menu  */
        permissionRoutes: (state) => {
          return buildMenu({
            routes: state.routes,
            rolesUser: state.user.roles
          });
        },
        name: (state) => state.user.name,
        email: (state) => state.user.email,
        id: (state) => state.user.id
      },
      mutations: {
        SET_ROUTES: (state, payload) => (state.routes = payload),
        SET_CURRENT_USER(state, payload) {

          if (payload.logout) {
            state.user.id = '';
            state.user.role = '';
            state.user.name = '';
            state.user.email = '';
            state.user.token = '';
          } else {
            state.user.id = payload._id;
            state.user.role = payload.role;
            state.user.roles = payload.roles;
            state.user.name = payload.name;
            state.user.email = payload.email;
            state.user.token = payload.token;
          }
        },
      },
      actions: {
        login: async ({
          commit,
        }, payload) => {
          try {
            const user = await AuthService.login({
              email: payload.email.trim(),
              password: payload.password
            });

            await commit('SET_CURRENT_USER', user);

          } catch (err) {

            console.warn('[vuex.auth] Login', err);
            commit('snackbar/SHOW_MESSAGE', {
              message: err.message,
              color: "pink accent-3",
              timeout: 3500
            }, {
              root: true
            });
          }
        },
        refreshInfoUser: async ({
          commit,
        }) => {
          try {
            const user = await UsersService.getCurrent();
            const userChange = {
              ...user,
              ...{
                logout: false
              }
            }

            commit('SET_CURRENT_USER', userChange);
          } catch (err) {
            console.warn('[vuex.auth] RefreshInfoUser', err);
            commit('snackbar/SHOW_MESSAGE', {
              message: err.message,
              color: "pink accent-3",
              timeout: 3500
            }, {
              root: true
            });
          }
        },
        logOut: async ({
          commit
        }) => {
          try {
            AuthService.logout();
            await commit('SET_USER_INFO', {});

          } catch (err) {
            console.warn('[vuex.user] LogOut', err);
          }
        },
        setInfoUser(commit, {
          item
        }) {
          commit('SET_CURRENT_USER', item);
        },
        register: async ({
          commit,
        }, payload) => {
          try {
            const response = await AuthService.register({
              email: payload.email.trim(),
              name: payload.name.trim(),
              role: 'admin',
              status: true,
              password: payload.password,
              passwordConfirm: payload.password
            });

            const user = {
              ...response.data.data,
              ...{
                token: response.data.token,
                logout: false
              }
            }
            await commit('SET_CURRENT_USER', user);

          } catch (err) {
            console.warn('[vuex.auth] Login', err);
            commit('snackbar/SHOW_MESSAGE', {
              message: err.message,
              color: "pink accent-3",
              timeout: 3500
            }, {
              root: true
            });
          }
        },
        generateMenu: async ({
          commit,
        }, payload) => {
          commit('SET_ROUTES', payload);
        }
      }
    }