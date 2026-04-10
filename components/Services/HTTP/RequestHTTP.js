class RequestHTTPS {

    constructor() {
        this.url = 'http://localhost:3842';
    }

    _buildUrl(endpoint) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const base = this.url.endsWith('/') ? this.url.slice(0, -1) : this.url;
        return `${base}/${cleanEndpoint}`;
    }

    async get(endpoint, options = {}) {
        return this._fetch(this._buildUrl(endpoint), { ...options, method: 'GET' });
    }

    async post(endpoint, body = {}, options = {}) {
        return this._fetch(this._buildUrl(endpoint), {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
    }

    async put(endpoint, body = {}, options = {}) {
        return this._fetch(this._buildUrl(endpoint), {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
    }

    async patch(endpoint, body = {}, options = {}) {
        return this._fetch(this._buildUrl(endpoint), {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
    }

    async delete(endpoint, options = {}) {
        return this._fetch(this._buildUrl(endpoint), { ...options, method: 'DELETE' });
    }

    async _fetch(url, options) {
        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            if (!response.ok) {
                throw { status: response.status, data };
            }
            return data;
        } catch (error) {
            // Optionally, handle/log error globally here
            throw error;
        }
    }
}

// Export a singleton instance
export const requestHTTPS = new RequestHTTPS();

