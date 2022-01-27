export const ROUTER = {
    HOME: '/',
    AUTHENTICATION: '/login',
    PROFILE: '/user',
    MAINPOST: '/p',
    EDIT: '/edit',
    SEARCH: '/search',
    ACCOUNT: '/account',
    MESSENGER: '/messenger',
}

export const ROUTER__MAIN = {
    HOME: '/',
    AUTHENTICATION: '/login',
    PROFILE: '/user/:username',
    MAINPOST: '/p/:post',
    EDIT: '/edit/:post',
    SEARCH: '/search',
    ACCOUNT: '/account',
    MESSENGER: '/messenger'
}

export const HEADER__ON = [
    ROUTER.HOME,
    '/edit',
    '/account'
]

export const SYNCRONIZED__LOADING__DEPENDENCY__ON__LOCATION = {
    post: [ROUTER.HOME, ROUTER.PROFILE],
    messenger: [ROUTER.MESSENGER]
}

export const ACCOUNT_EDIT_OPTIONS = {
    EDIT_PROFILE: '#edit_profile',
    CHANGE_PASSWORD: "#change-password"
}
