document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tabs = document.querySelectorAll('.tabs__item');
    const coursesGrid = document.getElementById('coursesGrid');
    const loadMoreBtn = document.querySelector('.courses__load-more');
    
    let currentCategory = 'all';
    let searchQuery = '';
    let debounceTimer = null;
    let currentDisplayCount = 9;
    const itemsPerPage = 9;
    let isLoading = false;

    function getFilteredCourses(category, search) {
        return store.filter(course => {
            const matchesCategory = category === 'all' || course.category === category;
            const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }

    function createCardElement(course) {
        const article = document.createElement('article');
        article.className = 'card';
        article.dataset.category = course.category;
        
        article.innerHTML = `
            <img src="${course.image}" alt="" class="card__image">
            <div class="card__content">
                <span class="card__badge card__badge--${course.category}">${categoryLabels[course.category]}</span>
                <h3 class="card__title">${course.title}</h3>
                <div class="card__info">
                    <span class="card__price">$${course.price}</span>
                    <div class="card__divider"></div>
                    <span class="card__author">by ${course.author}</span>
                </div>
            </div>
        `;
        
        return article;
    }

    function renderCards() {
        coursesGrid.innerHTML = '';
        
        const filteredCourses = getFilteredCourses(currentCategory, searchQuery);

        if (filteredCourses.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'courses__empty';
            emptyMessage.textContent = 'No courses found';
            coursesGrid.appendChild(emptyMessage);
            updateLoadMoreButton(0);
            updateTabCounts();
            return;
        }

        const displayCourses = filteredCourses.slice(0, currentDisplayCount);

        displayCourses.forEach(course => {
            const cardElement = createCardElement(course);
            coursesGrid.appendChild(cardElement);
        });

        updateLoadMoreButton(filteredCourses.length);
        updateTabCounts();
    }

    function updateLoadMoreButton(totalFilteredCount) {
        if (currentDisplayCount >= totalFilteredCount) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'flex';
        }
    }

    function setLoadingState(loading) {
        isLoading = loading;
        const loadMoreText = loadMoreBtn.querySelector('.load-more__text');
        
        if (loading) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.style.opacity = '0.5';
            loadMoreBtn.style.cursor = 'not-allowed';
            loadMoreText.textContent = 'Loading...';
        } else {
            loadMoreBtn.disabled = false;
            loadMoreBtn.style.opacity = '';
            loadMoreBtn.style.cursor = '';
            loadMoreText.textContent = 'Load more';
        }
    }

    function updateTabCounts() {
        tabs.forEach(tab => {
            const category = tab.dataset.category;
            const countElement = tab.querySelector('.tabs__count');
            const count = getFilteredCourses(category, searchQuery).length;
            countElement.textContent = count;
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('tabs__item--active'));
            this.classList.add('tabs__item--active');
            
            currentCategory = this.dataset.category;
            currentDisplayCount = itemsPerPage;
            renderCards();
        });
    });

    searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value;
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentDisplayCount = itemsPerPage;
            renderCards();
        }, 300);
    });

    loadMoreBtn.addEventListener('click', function() {
        if (isLoading) return;
        
        setLoadingState(true);
        
        setTimeout(() => {
            currentDisplayCount += itemsPerPage;
            renderCards();
            setLoadingState(false);
        }, 800);
    });

    renderCards();
});
