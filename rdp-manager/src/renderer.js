let connections = [];
let selectedConnection = null;

async function loadConnections() {
    connections = await window.rdpApi.loadConnections();
    renderConnectionsList();
}

function renderConnectionsList() {
    const list = document.getElementById('connectionsList');
    list.innerHTML = '';
    
    connections.forEach(conn => {
        const div = document.createElement('div');
        div.className = `connection-item ${selectedConnection?.id === conn.id ? 'selected' : ''}`;
        div.innerHTML = `
            <div class="monitor-frame">
                <div class="os-icon" style="background-image: url('https://cdn-icons-png.flaticon.com/512/888/888882.png')"></div>
                <div class="monitor-stand"></div>
            </div>
            <div class="connection-info">
                <div class="connection-name">${conn.name || conn.host}</div>
                <div class="connection-description">${conn.description || ''}</div>
            </div>
        `;
        
        // Left click to connect
        div.onclick = async (e) => {
            e.preventDefault();
            await window.rdpApi.connect(conn);
        };
        
        // Right click to edit
        div.oncontextmenu = (e) => {
            e.preventDefault();
            selectConnection(conn);
        };
        list.appendChild(div);
    });
}

function selectConnection(connection) {
    selectedConnection = connection;
    document.querySelector('.connection-details').style.display = 'block';
    document.getElementById('name').value = connection.name;
    document.getElementById('host').value = connection.host;
    document.getElementById('description').value = connection.description;
    renderConnectionsList();
}

function clearForm() {
    selectedConnection = null;
    document.querySelector('.connection-details').style.display = 'none';
    document.getElementById('connectionForm').reset();
    renderConnectionsList();
}

document.getElementById('newConnection').onclick = () => {
    selectedConnection = null;
    document.getElementById('connectionForm').reset();
    document.querySelector('.connection-details').style.display = 'block';
};

// Add event listeners for closing the form
document.querySelector('.overlay').onclick = clearForm;
document.querySelector('.close-button').onclick = clearForm;

document.getElementById('connectionForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const connection = {
        id: selectedConnection?.id || Date.now().toString(),
        name: document.getElementById('name').value,
        host: document.getElementById('host').value,
        description: document.getElementById('description').value
    };
    
    if (selectedConnection) {
        const index = connections.findIndex(c => c.id === selectedConnection.id);
        connections[index] = connection;
    } else {
        connections.push(connection);
    }
    
    await window.rdpApi.saveConnections(connections);
    clearForm();
    loadConnections();
};

document.getElementById('deleteBtn').onclick = async () => {
    if (!selectedConnection) return;
    connections = connections.filter(c => c.id !== selectedConnection.id);
    await window.rdpApi.saveConnections(connections);
    clearForm();
    loadConnections();
};

// Load connections when the app starts
loadConnections();

// Update handling
window.rdpApi.onUpdateAvailable((event, info) => {
    console.log('Update available:', info);
    // You could show a notification here
});

window.rdpApi.onUpdateDownloaded((event, info) => {
    if (confirm(`Version ${info.version} has been downloaded. Would you like to install it now?`)) {
        window.rdpApi.installUpdate();
    }
});

window.rdpApi.onUpdateError((event, error) => {
    console.error('Update error:', error);
});

function createConnectionCard(connection) {
    const template = document.getElementById('connection-template');
    const card = template.content.cloneNode(true);
    
    const hostname = card.querySelector('.hostname');
    const description = card.querySelector('.description');
    
    hostname.textContent = connection.name || connection.host;  // Show name if available, otherwise host
    description.textContent = connection.description || '';
    
    return card;
} 