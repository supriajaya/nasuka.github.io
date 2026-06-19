const firebaseConfig = { databaseURL: "https://nasukawireless-73c75-default-rtdb.asia-southeast1.firebasedatabase.app/" };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    const API_URL = 'https://script.google.com/macros/s/AKfycbyaTRKbOCb3pPKdcpwFL9VQKQtib3TUR4sJbX5rLEbo4yIZheeHpdvBm5cU_Wn_pmn1/exec';
    
    let userSaldo = 0;
    let currentActiveType = 'pulsa';
    let selectedProductValue = "";
    let selectedProductHarga = 0;
    let selectedProductQty = 0;
    let selectedProductName = "";

    function showAlert(msg) {
        document.getElementById('alertMessage').innerText = msg;
        document.getElementById('customAlert').style.display = 'flex';
    }

    function tutupCustomAlert() {
        document.getElementById('customAlert').style.display = 'none';
    }

    function resetSelectedProduct() {
        selectedProductValue = "";
        selectedProductHarga = 0;
        selectedProductQty = 0;
        selectedProductName = "";
        document.querySelectorAll('.product-item').forEach(el => el.classList.remove('selected'));
    }

    function pilihProdukGlow(element, value, harga, qty, name) {
        document.querySelectorAll('#panel-' + currentActiveType + ' .product-item').forEach(el => {
            el.classList.remove('selected');
        });
        element.classList.add('selected');
        selectedProductValue = value;
        selectedProductHarga = harga;
        selectedProductQty = qty;
        selectedProductName = name;
    }

    function detectOperator() {
        if (currentActiveType === 'smm') return;
        const no = document.getElementById('input-nomor-tujuan').value;
        let prefix = no.substring(0, 4);
        let operator = "";
        
        if (['0812', '0813', '0821', '0822', '0852', '0853', '0811'].includes(prefix)) operator = "TSEL";
        else if (['0817', '0818', '0819', '0877', '0878'].includes(prefix)) operator = "XL";
        else if (['0831', '0832', '0859', '0838'].includes(prefix)) operator = "AXIS";
        else if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) operator = "ISAT";
        else if (['0895', '0896', '0897', '0898', '0899'].includes(prefix)) operator = "TRI";
        else if (['0881', '0882', '0888'].includes(prefix)) operator = "FREN";
        
        const currentPanel = document.getElementById('panel-' + currentActiveType);
        if (!currentPanel) return;
        
        const items = currentPanel.querySelectorAll('.product-item');
        let firstVisible = null;
        
        items.forEach(item => {
            const op = item.getAttribute('data-op');
            if (op) {
                if (operator !== "" && op !== operator) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                    if (!firstVisible) firstVisible = item;
                }
            }
        });

        if (operator !== "" && firstVisible && (!selectedProductValue || document.querySelector('#panel-' + currentActiveType + ' .product-item.selected')?.style.display === 'none')) {
            firstVisible.click();
        }
    }

    function switchTab(type) {
        currentActiveType = type;
        resetSelectedProduct();
        
        const panels = ['panel-smm', 'panel-pln', 'panel-pulsa', 'panel-paket', 'panel-ewallet', 'panel-aktif'];
        panels.forEach(id => {
            document.getElementById(id).style.display = (id === 'panel-' + type) ? 'block' : 'none';
        });
        
        const inputTop = document.getElementById('input-top-container');
        const inputPln = document.getElementById('input-pln-container');
        const inputTujuan = document.getElementById('input-nomor-tujuan');
        
        if (type === 'pln') {
            inputTop.style.display = 'none';
            inputPln.style.display = 'block';
        } else {
            inputTop.style.display = 'block';
            inputPln.style.display = 'none';
            
            if (type === 'smm') {
                inputTujuan.removeAttribute('inputmode');
            } else if (['pulsa', 'paket', 'aktif'].includes(type)) {
                inputTujuan.setAttribute('inputmode', 'numeric');
            } else {
                inputTujuan.removeAttribute('inputmode');
            }
        }
        
        document.getElementById('footer-order').style.display = 'block';
        detectOperator();
        
        const activePanel = document.getElementById('panel-' + type);
        if (activePanel) {
            const firstItem = activePanel.querySelector('.product-item');
            if (firstItem && firstItem.style.display !== 'none') {
                firstItem.click();
            }
        }
    }

        function pilihKategori(kategori) {
        const mapping = { 'Pulsa': 'pulsa', 'Paket Data': 'paket', 'Ewallet': 'ewallet', 'Token Listrik': 'pln', 'SMM': 'smm', 'Masa Aktif': 'aktif' };
        if(!mapping[kategori]) return;
        switchTab(mapping[kategori]);
        
        // Perhatikan perubahan pada radioMap di bawah ini:
        const radioMap = { 'Pulsa': 'item1', 'Paket Data': 'item2', 'Masa Aktif': 'item3', 'Token Listrik': 'item6', 'SMM': 'item5', 'Ewallet': 'item4' };
        if(radioMap[kategori]) document.getElementById(radioMap[kategori]).checked = true;
    }








  function tampilkanModal(htmlContent, isSuccess = true) {
    const modal = document.getElementById('apiModal');
    const modalContent = document.getElementById('modalContent');
    const modalBody = document.getElementById('modalBody');
    

    modalContent.style.borderLeft = "none"; 
    modalContent.style.padding = "10px";
    
    modalBody.innerHTML = htmlContent;
    modal.style.display = 'flex';
}



    function tutupModal() {
        document.getElementById('apiModal').style.display = 'none';
    }

    function showLogin() {
        document.getElementById('loginOverlay').style.display = 'flex';
    }

    function hideLogin() {
        document.getElementById('loginOverlay').style.display = 'none';
    }

    function prosesLogin() {
        const phone = document.getElementById('loginPhone').value.trim();
        const pin = document.getElementById('loginPin').value.trim();
        const btn = document.getElementById('btnLoginAction');

        if (!phone || !pin) return showAlert('Data wajib diisi!');
        btn.disabled = true;
        db.ref('users/' + phone).once('value', snap => {
            if (snap.exists()) {
                if (String(snap.val().pin) === String(pin)) {
                    localStorage.setItem('userPhone', phone);
                    hideLogin();
                    initUserSession(phone);
                } else {
                    showAlert('PIN salah!');
                }
            } else {
                db.ref('users/' + phone).set({ pin: pin, saldo: 0 }).then(() => {
                    localStorage.setItem('userPhone', phone);
                    hideLogin();
                    initUserSession(phone);
                });
            }
            btn.disabled = false;
        });
    }




const dataEwallet = {
    'DANA': [
        {val: 'D1', harga: 1500, label: 'DANA 1.000'},
        {val: 'D10', harga: 10500, label: 'DANA 10.000'}
    ],
    'GOPAY': [
        {val: 'GOPAY10', harga: 10200, label: 'GOPAY 10.000'}
    ],
    'OVO': [
        {val: 'OVO10', harga: 10200, label: 'OVO 10.000'}
    ],
    'SHOPEEPAY': [
        {val: 'SHOPEEPAY10', harga: 10200, label: 'SHOPEEPAY 10.000'}
    ]
};

function pilihSubEwallet(sub) {
    const grid = document.getElementById('gridEwallet');
    grid.innerHTML = ''; // Kosongkan grid
    
    // Tampilkan produk berdasarkan sub-kategori
    dataEwallet[sub].forEach(item => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.onclick = function() { pilihProdukGlow(this, item.val, item.harga, 0, item.label); };
        div.innerHTML = `
            <div class="product-name">${item.label}</div>
            <div class="product-price">Rp ${item.harga.toLocaleString('id-ID')}</div>
        `;
        grid.appendChild(div);
    });
}


// Data produk SMM berdasarkan sub-kategori
const dataSMM = {
    'Tiktok': [
        {val: '40009', harga: 250, qty: 500, label: 'Views 500'},
        {val: '40009', harga: 38000, qty: 1000, label: 'Tiktok Tiktok 1K'}
    ],
    'Youtube': [
        {val: '40010', harga: 5000, qty: 100, label: 'Tiktok Youtube 100'},
        {val: '40010', harga: 45000, qty: 1000, label: 'Tiktok Youtube 1K'}
    ],
    'Instagram': [
        {val: '40011', harga: 2000, qty: 100, label: 'Tiktok Instagram 100'}
    ],
    'Facebook': [
        {val: '40009', harga: 300, qty: 1000, label: 'Tiktok Video Facebook 1K'},
        {val: '40009', harga: 2200, qty: 10000, label: 'Tiktok Video Facebook 10K'}
    ]
};

function pilihSubSMM(sub) {
    const grid = document.getElementById('gridSMM');
    grid.innerHTML = ''; // Mengosongkan grid sebelum diisi
    
    if (dataSMM[sub]) {
        dataSMM[sub].forEach(item => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.onclick = function() { pilihProdukGlow(this, item.val, item.harga, item.qty, item.label); };
            div.innerHTML = `
                <div class="product-name">${item.label}</div>
                <div class="product-price">Rp ${item.harga.toLocaleString('id-ID')}</div>
            `;
            grid.appendChild(div);
        });
    }
}



    function initUserSession(ph) {
        if (ph) {
            document.querySelector('.balance-container').style.display = 'flex';
            db.ref('users/' + ph + '/saldo').on('value', snap => {
                userSaldo = snap.val() || 0;
                document.getElementById('display-saldo').innerText = "Rp " + userSaldo.toLocaleString('id-ID');
            });
            initGlobalStatusListener();
        }
    }

    function formatStrukStatus(data) {
    const now = new Date().toLocaleString('id-ID');
    const isPLN = data.product && data.product.toLowerCase().includes('pln');
    
  
    const snLine = (data.sn) ? `
        <div style="margin-top:10px;">SN/TOKEN:</div>
        <div class="sn-box">${data.sn}</div>` : '';

    return `
        <div class="struk-content">
            <div style="text-align:center; font-weight:bold; border-bottom: 1px dashed #000; padding-bottom:5px;">
                <br>STATUS: ${data.status.toUpperCase()}
            </div>
            <div style="margin: 10px 0; font-size: 13px;">
                <div class="struk-row"><span>Waktu:</span> <span>${now}</span></div>
                <div class="struk-row"><span>ID Order:</span> <span>${data.refID || '-'}</span></div>
                <div class="struk-row"><span>Tujuan:</span> <span>${data.dest || '-'}</span></div>
                <div class="struk-row"><span>Produk:</span> <span>${data.product || '-'}</span></div>
                <div class="struk-row"><span>Harga:</span> <span>Rp ${data.price ? data.price.toLocaleString('id-ID') : '0'}</span></div>
            </div>
            ${snLine}
            <div style="border-top: 1px dashed #000; padding-top:5px; text-align:center; font-size: 12px;">
                Terima Kasih atas Kepercayaan Anda
            </div>
        </div>`;
}

function initGlobalStatusListener() {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) return;
    
    // Kita gunakan 'child_changed' namun filter agar hanya memproses status akhir
    db.ref(`users/${userPhone}/riwayat`).on('child_changed', (snapshot) => {
        const data = snapshot.val();
        if (data.status === 'success' || data.status === 'failed') {
            tampilkanModal(formatStrukStatus(data), data.status === 'success');
        }
    });
}






    function toggleDropdown() {
        const menu = document.getElementById('dropdownMenu');
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }

  
    window.onclick = function(event) {
        if (!event.target.matches('.titik-tiga')) {
            const dropdowns = document.getElementsByClassName("dropdown-menu");
            for (let i = 0; i < dropdowns.length; i++) {
                dropdowns[i].style.display = "none";
            }
        }
    }


    function batasiInputAngka(elementId, maxLength) {
        const inputEl = document.getElementById(elementId);
        if(inputEl) {
            inputEl.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
                if (this.value.length > maxLength) this.value = this.value.slice(0, maxLength);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const inputTujuan = document.getElementById('input-nomor-tujuan');
        inputTujuan.addEventListener('input', () => {
            if (['pulsa', 'paket', 'aktif'].includes(currentActiveType)) inputTujuan.value = inputTujuan.value.replace(/[^0-9]/g, '');
            detectOperator();
        });
        batasiInputAngka('loginPhone', 13);
        batasiInputAngka('loginPin', 4);
        batasiInputAngka('meter_id', 20);
    });

    window.onload = () => {
        const ph = localStorage.getItem('userPhone');
        initUserSession(ph);
        switchTab('pulsa');
    };
    
    function logout() { localStorage.clear(); location.reload(); }


    
    
    
    function formatApiResponse(res) {
    if (res.success || res.status) {
        const d = res.data || {};
        const now = new Date().toLocaleString('id-ID');
        
        return `
        <div class="struk-container">
            <div class="struk-header">
                NASUKA WIRELESS<br>
            
            </div>
            <div class="struk-body">
                <div><span>Waktu:</span> <span>${now}</span></div>
                <div><span>ID Order:</span> <span>${d.order_number || '-'}</span></div>
                <div><span>Tujuan:</span> <span>${document.getElementById('input-nomor-tujuan').value || document.getElementById('meter_id').value}</span></div>
                <div><span>Produk:</span> <span>${selectedProductName || 'Reguler'}</span></div>
                <div style="font-size: 16px; margin-top:10px;"><span>TOTAL:</span> <span>Rp ${selectedProductHarga.toLocaleString('id-ID')}</span></div>
            </div>
            <div class="struk-footer">
                TERIMA KASIH
            </div>
        </div>`;
    } else {
        return `<div style="text-align:center; color: red;"><strong>TRANSAKSI GAGAL</strong><br>${res.message || 'Terjadi kesalahan sistem'}</div>`;
    }
}

    
    
    
    

    async function postOrder(urlData, resId) {
        const btn = document.getElementById('btn-beli-dinamis');
        btn.disabled = true; btn.innerText = 'Memproses...';
        try {
            const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(urlData) });
            const result = await response.json();
            if(result.status === true || result.success === true) {
                await db.ref(`users/${localStorage.getItem('userPhone')}/riwayat/${urlData.refID}`).set({ 
                    refID: urlData.refID, product: urlData.product, dest: urlData.dest, status: 'ordered', price: urlData.price, timestamp: new Date().toISOString()
                });
            }
            tampilkanModal(formatApiResponse(result), (result.status === true || result.success === true));
        } catch (err) { showAlert('Terjadi kesalahan.'); } finally { btn.disabled = false; btn.innerText = 'Beli Sekarang'; }
    }

    function eksekusiBeli() {
        const ph = localStorage.getItem('userPhone');
        if (!ph) return showLogin();
        const dest = (currentActiveType === 'pln') ? document.getElementById('order_meter_id').value : document.getElementById('input-nomor-tujuan').value;
        if(!dest || !selectedProductValue) return showAlert("Lengkapi data!");
        if (userSaldo < selectedProductHarga) return showAlert("Saldo kurang!");

        const common = { 
            refID: currentActiveType.toUpperCase() + Date.now(), 
            userPhone: ph, 
            price: selectedProductHarga, 
            product: selectedProductValue, 
            dest: dest 
        };

        if (currentActiveType === 'smm') postOrder({ ...common, action: 'order', service: selectedProductValue, quantity: selectedProductQty }, 'result');
        else if (currentActiveType === 'pln') postOrder({ ...common, action: 'orderPLN' }, 'resultPLN');
        else postOrder({ ...common, action: 'order' + currentActiveType.charAt(0).toUpperCase() + currentActiveType.slice(1) }, 'result' + currentActiveType.charAt(0).toUpperCase() + currentActiveType.slice(1));
    }

    document.getElementById('btnCheck').onclick = async () => {
        const m = document.getElementById('meter_id').value;
        if (!m) return showAlert("Masukkan ID!");
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'checkPLN', meter_id: m }) });
        const data = await res.json();
        if(data.success) { 
            tampilkanModal(`<strong>Nama:</strong> ${data.data.name}<br><strong>Daya:</strong> ${data.data.power_formatted}`, true);
            document.getElementById('order_meter_id').value = data.data.meter_id; 
        } else { 
            tampilkanModal(`<strong>Error:</strong> ${data.message}`, false);
        }
    };
    
    
    
    const produkData = {
    pulsa: [
        { op: 'XL', val: 'X5', harga: 106500, nama: 'XL 5rb' },
        { op: 'TSEL', val: 'S5', harga: 5500, nama: 'Telkomsel 5rb' }
      
    ],
    paket: [
        { op: 'AXIS', val: 'AXIS_D1', harga: 10000, nama: 'Axis 1GB 1Jam' },
     { op: 'XL', val: 'AXIS_D1', harga: 1250, nama: 'Axis 1GB 1Jam' }
    ],
    aktif: [
        { op: 'XL', val: 'MA_XL_7', harga: 5000, nama: 'Masa Aktif XL 30 Hari' },
      { op: 'TSEL', val: 'MA_XL_7', harga: 5000, nama: 'Masa Aktif XL 30 Hari' }
      
    ]
};


function renderProduk(type) {
    const grid = document.getElementById('grid' + type.charAt(0).toUpperCase() + type.slice(1));
    if (!grid) return;
    
    grid.innerHTML = '';
    const items = produkData[type] || [];
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.setAttribute('data-op', item.op);
        div.onclick = function() { pilihProdukGlow(this, item.val, item.harga, 0, item.nama); };
        div.innerHTML = `
            <div class="product-name">${item.nama}</div>
            <div class="product-price">Rp ${item.harga.toLocaleString('id-ID')}</div>
        `;
        grid.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderProduk('pulsa');
    renderProduk('paket');
    renderProduk('aktif');
});

    
    
    
