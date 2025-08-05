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
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm.trim() === '') {
        showNotification(translations[currentLang].searchHint || '请输入搜索关键词');
        return;
    }
    showNotification(`${translations[currentLang].searching || '正在搜索'}: ${searchTerm}...`);

    // 延迟搜索以显示加载状态
    setTimeout(() => {
        performSearch(searchTerm);
    }, 500);
}

// 执行实际搜索
function performSearch(searchTerm) {
    // 隐藏所有分类
    document.querySelectorAll('.category').forEach(category => {
        category.style.display = 'none';
    });

    // 创建搜索结果容器（如果不存在）
    let searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) {
        searchResultsContainer = document.createElement('section');
        searchResultsContainer.id = 'searchResults';
        searchResultsContainer.className = 'category';
        searchResultsContainer.innerHTML = `
            <h2 class="category-title">${translations[currentLang].searchResults || '搜索结果'}</h2>
            <div class="book-grid"></div>
        `;
        document.querySelector('main').appendChild(searchResultsContainer);
    } else {
        // 清空之前的搜索结果
        searchResultsContainer.querySelector('.book-grid').innerHTML = '<div class="book-placeholder">搜索中...</div>';
    }

    const bookGrid = searchResultsContainer.querySelector('.book-grid');
    let results = [];

    // 异步搜索所有分类的书籍
    const searchPromises = [];
    const categories = document.querySelectorAll('.category[id]:not(#searchResults)');

    categories.forEach(category => {
        const categoryId = category.id;
        const searchPromise = new Promise((resolve, reject) => {
            // 获取分类目录
            const xhr = new XMLHttpRequest();
            // 改进多级目录处理
            const folderPath = folder.href.replace(/^.*?books\//, '');
            
            // 增强分类加载能力
            xhr.open('GET', `books/${encodeURIComponent(categoryId)}/`);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(xhr.responseText, 'text/html');
                        
                        // 解析目录中的文件夹（书籍）
                        // 动态获取所有子目录
const folders = Array.from(doc.querySelectorAll('a[href$="/"]')).concat(
  Array.from(doc.querySelectorAll('a[href$=".txt"]'))
);
                        
                        const folderPromises = folders.map(folder => {
                            return new Promise((folderResolve, folderReject) => {
                                const folderName = folder.innerText.replace('/', '');
                                const folderPath = `books/${categoryId}/${folderName}`;
                                
                                // 读取Information文件
                                try {
                                    const infoXhr = new XMLHttpRequest();
                            infoXhr.open('GET', `${folderPath}/Information.txt`, true);
                                    infoXhr.onreadystatechange = function() {
                                        if (infoXhr.readyState === 4) {
                                            if (infoXhr.status === 200) {
                                                const infoContent = infoXhr.responseText;
                                                const infoLines = infoContent.split('\n');
                                                
                                                // 解析Information文件内容
                                                let bookTitle = folderName;
                                                let publishDate = '';
                                                let category = '';
                                                let description = '';

                                                infoLines.forEach(line => {
                                                    if (line.startsWith('书名：')) {
                                                        bookTitle = line.substring(3);
                                                    } else if (line.startsWith('发布时间：')) {
                                                        publishDate = line.substring(5);
                                                    } else if (line.startsWith('所在分类：')) {
                                                        category = line.substring(5);
                                                    } else if (line.startsWith('简介：')) {
                                                        description = line.substring(3);
                                                    }
                                                });

                                                // 检查是否匹配搜索词
                                                if (bookTitle.toLowerCase().includes(searchTerm) || description.toLowerCase().includes(searchTerm)) {
                                                    // 创建书籍卡片数据
                                                    // 自动生成测试内容
if (folderName === '文章测试') {
  results.push({
    title: '自动化测试文章',
    publishDate: new Date().toISOString().split('T')[0],
    category: categoryId,
    description: '系统自动生成的测试内容',
    folderPath: folderPath,
    categoryName: translations[currentLang].categories[categoryId]?.name || categoryId
  });
}
results.push({
                                                        title: bookTitle,
                                                        publishDate: publishDate,
                                                        category: category,
                                                        description: description,
                                                        folderPath: folderPath,
                                                        categoryName: translations[currentLang].categories[categoryId]?.name || categoryId
                                                    });
                                                }
                                                folderResolve();
                                            } else {
                                                folderResolve(); // 即使失败也继续
                                            }
                                        }
                                    };
                                    infoXhr.send();
                                } catch (infoError) {
                                    folderResolve(); // 即使失败也继续
                                }
                            });
                        });

                        Promise.all(folderPromises).then(() => {
                            resolve();
                        });
                    } else {
                        resolve(); // 即使失败也继续
                    }
                }
            };
            xhr.send();
        });

        searchPromises.push(searchPromise);
    });

    // 所有搜索完成后显示结果
    Promise.all(searchPromises).then(() => {
        bookGrid.innerHTML = '';

        if (results.length === 0) {
            bookGrid.innerHTML = `<div class="book-placeholder">${translations[currentLang].noSearchResults || '未找到相关书籍'}</div>`;
        } else {
            // 创建搜索结果书籍卡片
            results.forEach(book => {
                const bookCard = document.createElement('div');
                bookCard.className = 'book-card';
                bookCard.innerHTML = `
                    <span class="search-category-label">${book.categoryName}</span>
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-meta">${book.publishDate} | ${book.category}</p>
                    <div class="book-excerpt">${book.description}</div>
                    <a href="book-detail.html?book=${book.folderPath}&chapter=1" class="read-more">阅读更多</a>
                `;
                bookGrid.appendChild(bookCard);
            });
        }

        // 显示搜索结果
        searchResultsContainer.style.display = 'block';
        showNotification(`${translations[currentLang].foundResults || '找到结果'}: ${results.length}`);
    });
}

// 添加搜索结果分类标签样式
const style = document.createElement('style');
style.textContent = `
    .search-category-label {
        display: inline-block;
        background-color: #8b7355;
        color: #f9f6f0;
        font-size: 8px;
        padding: 2px 5px;
        margin-bottom: 5px;
        border-radius: 2px;
    }
`;
 document.head.appendChild(style);

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
                // 加载该分类的书籍
                loadBooks(categoryId);
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
            // 隐藏所有分类
            document.querySelectorAll('.category').forEach(cat => {
                cat.style.display = 'none';
            });
            // 显示对应的子分类
            const subcategoryElement = document.getElementById(subcategory);
            if (subcategoryElement) {
                subcategoryElement.style.display = 'block';
                // 加载该子分类的书籍
                loadBooks(subcategory);
                showNotification(`已选择${this.textContent}`);
            }
        });
    });
}

// 动态加载书籍
function loadBooks(categoryId = null) {
    // 清空所有书籍网格或特定分类的网格
    if (categoryId) {
        const category = document.getElementById(categoryId);
        if (category) {
            const bookGrid = category.querySelector('.book-grid');
            bookGrid.innerHTML = '<div class="book-placeholder">加载中...</div>';
        }
    } else {
        document.querySelectorAll('.book-grid').forEach(grid => {
            grid.innerHTML = '<div class="book-placeholder">加载中...</div>';
        });
    }

    // 确定要加载的分类
    const categoriesToLoad = categoryId ? [document.getElementById(categoryId)] : document.querySelectorAll('.category[id]');

    categoriesToLoad.forEach(category => {
        if (!category) return;

        const currentCategoryId = category.id;
        const bookGrid = category.querySelector('.book-grid');

        // 获取分类目录
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `books/${currentCategoryId}/`, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(xhr.responseText, 'text/html');

                    // 解析目录中的文件夹（书籍）
                    const folders = doc.querySelectorAll('a[href$="/"]');

                    if (folders.length === 0) {
                        bookGrid.innerHTML = `<div class="book-placeholder">${translations[currentLang].noBooks || '暂无书籍'}</div>`;
                        return;
                    }

                    // 清空书籍网格
                    bookGrid.innerHTML = '';

                    // 处理所有文件夹的加载
                    const folderPromises = Array.from(folders).map(folder => {
                        return new Promise((resolve, reject) => {
                            const folderName = folder.innerText.replace('/', '');
                            const folderPath = folder.href.replace(window.location.origin + '/books/', '').replace(/\/$/, '');

                            // 读取Information文件
                            const infoXhr = new XMLHttpRequest();
                            infoXhr.open('GET', `${folderPath}/Information.txt`, true);
                            infoXhr.onreadystatechange = function() {
                                if (infoXhr.readyState === 4) {
                                    try {
                                        if (infoXhr.status === 200) {
                                            const infoContent = infoXhr.responseText;
                                            const infoLines = infoContent.split('\n');

                                            // 解析Information文件内容
                                            let bookTitle = folderName;
                                            let publishDate = '';
                                            let category = '';
                                            let description = '';

                                            infoLines.forEach(line => {
                                                if (line.startsWith('书名：')) {
                                                    bookTitle = line.substring(3);
                                                } else if (line.startsWith('发布时间：')) {
                                                    publishDate = line.substring(5);
                                                } else if (line.startsWith('所在分类：')) {
                                                    category = line.substring(5);
                                                } else if (line.startsWith('简介：')) {
                                                    description = line.substring(3);
                                                }
                                            });

                                            // 创建书籍卡片
                                            const bookCard = document.createElement('div');
                                            bookCard.className = 'book-card';
                                            bookCard.innerHTML = `
                                                <h3 class="book-title">${bookTitle}</h3>
                                                <p class="book-meta">${publishDate} | ${category}</p>
                                                <div class="book-excerpt">${description}</div>
                                                <a href="book-detail.html?book=${folderPath}&chapter=1" class="read-more">阅读更多</a>
                                            `;
                                            bookGrid.appendChild(bookCard);
                                        } else {
                                            // 如果无法获取Information文件，使用默认信息
                                            const bookCard = document.createElement('div');
                                            bookCard.className = 'book-card';
                                            bookCard.innerHTML = `
                                                <h3 class="book-title">${folderName}</h3>
                                                <p class="book-meta">未知 | 未知</p>
                                                <div class="book-excerpt">无法加载书籍信息</div>
                                                <a href="${folderPath}/1.html" class="read-more">阅读更多</a>
                                            `;
                                            bookGrid.appendChild(bookCard);
                                        }
                                    } catch (infoError) {
                                        // 错误处理
                                        const bookCard = document.createElement('div');
                                        bookCard.className = 'book-card';
                                        bookCard.innerHTML = `
                                            <h3 class="book-title">${folderName}</h3>
                                            <p class="book-meta">未知 | 未知</p>
                                            <div class="book-excerpt">加载失败</div>
                                            <a href="${folderPath}/1.html" class="read-more">阅读更多</a>
                                        `;
                                        bookGrid.appendChild(bookCard);
                                    }
                                    resolve();
                                }
                            };
                            infoXhr.send();
                        });
                    });

                    // 所有文件夹加载完成后
                    Promise.all(folderPromises).then(() => {
                        // 如果没有书籍卡片被添加
                        if (bookGrid.children.length === 0) {
                            bookGrid.innerHTML = `<div class="book-placeholder">${translations[currentLang].noBooks || '暂无书籍'}</div>`;
                        }
                    });
                } else {
                    bookGrid.innerHTML = `<div class="book-placeholder">${translations[currentLang].loadError || '加载失败'}</div>`;
                }
            }
        };
        xhr.send();
    });
}

// 从HTML文件加载书籍的函数已被新的实现替代，此函数留空
function loadBooksFromHtml(categoryId, bookGrid) {
    bookGrid.innerHTML = '<div class="book-placeholder">暂无书籍</div>';
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载语言文件
    loadLanguages();

    // 初始隐藏所有分类，只显示小说分类
    showCategory('novel');

    // 设置导航点击事件
    setupNavClickEvents();

    // 设置二级分类按钮点击事件
    setupSubcategoryClickEvents();

    // 加载书籍
    loadBooks();
});