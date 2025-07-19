import { init as initMenu } from './menu.js';
import { init as initConfig } from './config.js';
import { init as initClients } from './clients.js';
import { init as initProducts } from './products.js';
import { init as initInvoice } from './invoice.js';

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initConfig();
    initClients();
    initProducts();
    initInvoice();
});
