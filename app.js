/* ============================================================
   PART 1 — STORAGE
   ============================================================ */
const STORAGE_KEY = 'rt_requests';

function loadRequests() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

function saveRequests(requests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

let requests = loadRequests();


/* ============================================================
   PART 2 & 3 — FORM SUBMIT: read inputs, build object, save
   ============================================================ */
const form = document.getElementById('request-form');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const product  = document.getElementById('product').value;
    const type     = document.getElementById('request-type').value;
    const message  = document.getElementById('message').value.trim();
    const priority = document.querySelector('input[name="priority"]:checked').value;

    // Basic validation — stop if required fields are empty
    if (!name || !email || !product || !type || !message) {
        alert('Please fill in all fields.');
        return;
    }

    const newRequest = {
        id: Date.now().toString(),
        name: name,
        email: email,
        product: product,
        type: type,
        priority: priority,
        message: message,
        status: 'New',
        createdAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    saveRequests(requests);

    form.reset();

    // Show the "submitted" confirmation briefly
    const successMsg = document.getElementById('success-msg');
    successMsg.style.display = 'block';
    setTimeout(function () {
        successMsg.style.display = 'none';
    }, 2500);

    render(); // redraw the list to include the new request
});


/* ============================================================
   PART 4 — RENDERING
   Turn the `requests` array into actual HTML on the page.
   We rebuild the WHOLE list every time something changes.
   This is simpler to reason about than trying to update
   individual cards by hand.
   ============================================================ */

// Maps used to pick the right CSS badge class for each value.
const typeBadge = {
    'Bug': 'badge-bug',
    'Feature Request': 'badge-feature',
    'General Feedback': 'badge-feedback',
    'Partnership': 'badge-partnership',
    'Other': 'badge-other'
};

const priorityBadge = {
    'Low': 'badge-low',
    'Medium': 'badge-med',
    'High': 'badge-high'
};

const statusBadge = {
    'New': 'badge-new',
    'In Review': 'badge-in-review',
    'Resolved': 'badge-resolved',
    'Rejected': 'badge-rejected'
};

// Turns "2026-06-19T10:42:00.000Z" into something readable, e.g. "19 Jun 2026, 10:42"
function formatDate(isoString) {
    const d = new Date(isoString);
    const day = d.getDate();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return day + ' ' + month + ' ' + year + ', ' + hours + ':' + mins;
}

// Escapes user text so it can't break our HTML or inject scripts.
// e.g. turns <script> into &lt;script&gt; so it displays as text, not code.
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Builds the HTML string for ONE request card.
function buildCardHtml(req) {
    return `
    <div class="request-card" data-id="${req.id}">
      <div class="card-head">
        <div class="name-email">
          <div class="requester-name">${escapeHtml(req.name)}</div>
          <div class="requester-email">${escapeHtml(req.email)}</div>
        </div>
        <div class="tag-group">
          <span class="badge ${typeBadge[req.type] || 'badge-other'}">${escapeHtml(req.type)}</span>
          <span class="badge ${priorityBadge[req.priority] || 'badge-low'}">${escapeHtml(req.priority)}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="request-product">Product: <span>${escapeHtml(req.product)}</span></div>
        <div class="request-message">${escapeHtml(req.message)}</div>
      </div>
      <div class="card-foot">
        <span class="request-date">${formatDate(req.createdAt)}</span>
        <div class="card-actions">
          <select class="status-select" data-id="${req.id}">
            <option value="New" ${req.status === 'New' ? 'selected' : ''}>New</option>
            <option value="In Review" ${req.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Resolved" ${req.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option value="Rejected" ${req.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
          <button class="delete-btn" data-id="${req.id}" title="Delete">✕</button>
        </div>
      </div>
    </div>
  `;
}

// The main render function — call this any time `requests` changes,
// or any time a filter changes.
function render() {
    const listEl = document.getElementById('requests-list');
    const statsEl = document.getElementById('list-stats');
    const headerCountEl = document.getElementById('header-count');

    // Get the currently visible (filtered) requests
    const visible = getFilteredRequests();

    // Update header count (always shows TOTAL, not filtered)
    headerCountEl.textContent = requests.length + ' request' + (requests.length === 1 ? '' : 's');

    // Update the stats line
    if (requests.length === 0) {
        statsEl.textContent = 'No requests yet.';
    } else if (visible.length === requests.length) {
        statsEl.textContent = 'Showing all ' + requests.length + ' requests';
    } else {
        statsEl.textContent = 'Showing ' + visible.length + ' of ' + requests.length + ' requests';
    }

    // Empty state vs list of cards
    if (visible.length === 0) {
        listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>${requests.length === 0 ? 'No requests yet. Submit one using the form.' : 'No requests match your filters.'}</p>
      </div>
    `;
    } else {
        // .map() turns each request object into an HTML string,
        // .join('') glues all those strings together into one big string.
        listEl.innerHTML = visible.map(buildCardHtml).join('');
    }
}


/* ============================================================
   PART 5 — STATUS CHANGE + DELETE
   The tricky part: cards are created AFTER the page loads, so we
   can't attach a click listener directly to a delete button — it
   doesn't exist yet when the page first runs.
   The fix is EVENT DELEGATION: we attach ONE listener to the
   parent container (#requests-list), which DOES exist from the
   start. Clicks on children "bubble up" to the parent, so we can
   catch them there and check what was actually clicked.
   ============================================================ */

const listContainer = document.getElementById('requests-list');

// Listen for ANY click inside the list container.
listContainer.addEventListener('click', function (event) {
    // event.target = the exact element that was clicked.
    // We check if it (or what it's inside) is a delete button.
    const deleteBtn = event.target.closest('.delete-btn');
    if (!deleteBtn) return; // click wasn't on a delete button — ignore it

    const idToDelete = deleteBtn.dataset.id; // dataset reads data-id="..." from the HTML

    const confirmed = confirm('Delete this request?');
    if (!confirmed) return;

    // .filter() builds a NEW array containing everything EXCEPT
    // the one whose id matches — this is how we "delete" from an array.
    requests = requests.filter(function (req) {
        return req.id !== idToDelete;
    });

    saveRequests(requests);
    render();
});

// Listen for status dropdown changes (event = 'change', not 'click')
listContainer.addEventListener('change', function (event) {
    const select = event.target.closest('.status-select');
    if (!select) return;

    const idToUpdate = select.dataset.id;
    const newStatus = select.value;

    // .find() returns the FIRST object in the array matching the condition.
    const req = requests.find(function (r) {
        return r.id === idToUpdate;
    });

    if (req) {
        req.status = newStatus; // mutate the object directly
        saveRequests(requests);
        render();
    }
});


/* ============================================================
   PART 6 — FILTERING & SEARCH
   getFilteredRequests() reads the current filter controls and
   returns a NEW array containing only the requests that match
   ALL active filters. render() calls this instead of using
   `requests` directly.
   ============================================================ */

function getFilteredRequests() {
    const searchText = document.getElementById('search').value.trim().toLowerCase();
    const productFilter  = document.getElementById('filter-product').value;
    const typeFilter      = document.getElementById('filter-type').value;
    const priorityFilter  = document.getElementById('filter-priority').value;
    const statusFilter    = document.getElementById('filter-status').value;

    // .filter() keeps only the items where the function returns true.
    return requests.filter(function (req) {
        if (productFilter && req.product !== productFilter) return false;
        if (typeFilter && req.type !== typeFilter) return false;
        if (priorityFilter && req.priority !== priorityFilter) return false;
        if (statusFilter && req.status !== statusFilter) return false;

        if (searchText) {
            // Combine the searchable fields into one lowercase string,
            // then check if it CONTAINS what the user typed.
            const haystack = (req.name + ' ' + req.email + ' ' + req.message).toLowerCase();
            if (!haystack.includes(searchText)) return false;
        }

        return true; // passed every check — keep it
    });
}

// Re-render whenever any filter control changes.
document.getElementById('search').addEventListener('input', render);
document.getElementById('filter-product').addEventListener('change', render);
document.getElementById('filter-type').addEventListener('change', render);
document.getElementById('filter-priority').addEventListener('change', render);
document.getElementById('filter-status').addEventListener('change', render);

document.getElementById('clear-filters').addEventListener('click', function () {
    document.getElementById('search').value = '';
    document.getElementById('filter-product').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-priority').value = '';
    document.getElementById('filter-status').value = '';
    render();
});


/* INITIAL RENDER
   Runs once when the page first loads, so any requests saved
   from a previous visit show up immediately.
    */
render();