// 语言切换功能
let currentLang = 'zh';
let translations = {};

// 加载语言文件
function loadLanguages() {
    try {
        // 同步加载语言文件
        const xhrZh = new XMLHttpRequest();
        xhrZh.open('GET', 'lang/zh.json', false);
        xhrZh.send();
        translations.zh = JSON.parse(xhrZh.responseText);

        const xhrEn = new XMLHttpRequest();
        xhrEn.open('GET', 'lang/en.json', false);
        xhrEn.send();
        translations.en = JSON.parse(xhrEn.responseText);

        updatePageLanguage();
    } catch (error) {
        console.error('加载语言文件失败:', error);
        alert('加载语言文件失败，请检查文件是否存在');
    }
}

// 更新页面语言
function updatePageLanguage() {
    const langData = translations[currentLang];
    if (!langData) return;

    // 更新网站名称和标语
    document.querySelector('.logo').textContent = langData.siteName;
    document.querySelector('.tagline').textContent = langData.tagline;

    // 更新导航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === '#novel') {
            item.textContent = langData.nav.novel;
        } else if (href === '#essay') {
            item.textContent = langData.nav.essay;
        } else if (href === '#poetry') {
            item.textContent = langData.nav.poetry;
        } else if (href === '#script') {
            item.textContent = langData.nav.script;
        } else if (href.includes('about')) {
            item.textContent = langData.nav.about;
        } else if (href.includes('contact')) {
            item.textContent = langData.nav.contact;
        }
    });

    // 更新搜索框
    document.getElementById('searchInput').placeholder = langData.search;
    document.querySelector('.search-button').textContent = langData.searchButton;

    // 更新页脚
    document.querySelector('.footer p').textContent = langData.footer;

    // 更新分类标题
    document.querySelectorAll('.category-title').forEach(title => {
        const category = title.parentElement.id;
        if (langData.categories[category]) {
            title.textContent = langData.categories[category].name;
        }
    });

    // 更新二级分类按钮
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        const category = btn.getAttribute('data-category');
        const subcategory = btn.getAttribute('data-subcategory');
        if (langData.categories[category] && langData.categories[category].subcategories[subcategory]) {
            btn.textContent = langData.categories[category].subcategories[subcategory];
        }
    });

    // 更新暂无书籍提示
    document.querySelectorAll('.book-placeholder').forEach(placeholder => {
        placeholder.textContent = langData.noBooks;
    });
}

// 切换语言
function switchLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    updatePageLanguage();
    showNotification(`已切换到${lang === 'zh' ? '中文' : '英文'}`);
}

// 搜索功能
function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm.trim() === '') {
        showNotification(translations[currentLang].searchHint || '请输入搜索关键词');
        return;
    }
    showNotification(`${translations[currentLang].searching || '正在搜索'}: ${searchTerm}...`);

    // 模拟搜索延迟
    setTimeout(() => {
        // 在实际应用中，这里会根据搜索词和分类筛选书籍
        showNotification(translations[currentLang].noSearchResults || '未找到相关书籍');
    }, 1000);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // 计算居中位置
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const aboutModal = document.getElementById('aboutModal');
    const contactModal = document.getElementById('contactModal');
    
    if (event.target === aboutModal) {
        aboutModal.style.display = 'none';
    }
    if (event.target === contactModal) {
        contactModal.style.display = 'none';
    }
}

// 显示特定分类并隐藏其他分类
function showCategory(categoryId) {
    // 隐藏所有分类
    document.querySelectorAll('.category').forEach(category => {
        category.style.display = 'none';
    });
    
    // 显示选中分类
    const selectedCategory = document.getElementById(categoryId);
    if (selectedCategory) {
        selectedCategory.style.display = 'block';
    }
}

// 导航点击事件
function setupNavClickEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const categoryId = href.substring(1);
                showCategory(categoryId);
            }
        });
    });
}

// 二级分类按钮点击事件
function setupSubcategoryClickEvents() {
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const subcategory = this.getAttribute('data-subcategory');
            showNotification(`已选择${this.textContent}`);
            // 在实际应用中，这里会根据分类加载对应的书籍
        });
    });
}