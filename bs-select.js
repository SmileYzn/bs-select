(function ()
{
    'use strict';
    
    function deepMerge(primaryObject, secondaryObject)
    {
        for (const key in secondaryObject)
        {
            if (secondaryObject.hasOwnProperty(key))
            {
                if (secondaryObject[key] instanceof Object && primaryObject[key] instanceof Object)
                {
                    primaryObject[key] = deepMerge(primaryObject[key], secondaryObject[key]);
                }
                else
                {
                    primaryObject[key] = secondaryObject[key];
                }
            }
        }
        
        return primaryObject;
    };
    
    function debounceFunction(func, delay)
    {
        let id = 0;

        return function (...args)
        {
            clearTimeout(id);

            id = setTimeout(() =>
            {
                func.apply(this, args);
            }, delay);
        };
    };

    function bsSelect(element, options)
    {
        if (!element || element.tagName !== 'SELECT')
        {
            throw new Error('Use a <select> element to work with bsSelect.');
        }

        this.element = element;

        this.options = deepMerge
        ({
            create: false,
            clear: false,
            search: true,
            maxHeight: '400px',
            debounceSearch: 300,
            clearBackspace: true,
            searchMinLength: 3,
            autoClose: false,
            hideSelected: false,
            lang:
            {
                searchAddPlaceholder: 'Type ENTER to add: [search-value]',
                noResults: 'No results found',
                typeSearch: 'Type [length] or more characters to search',
                clearSelect: 'Clear selection',
                placeholder: 'Select an option',
                placeholderMultiple: 'Select one or more options',
            },
            icon:
            {
                clear: 'bi bi-x',
                removeTag: 'bi bi-x-circle-fill'
            }
        }, options);
        
        const create = () =>
        {
            if (this.dropdownSearch)
            {
                if (this.dropdownSearch.tagName === 'INPUT')
                {
                    const value = this.dropdownSearch.value.trim();

                    if (value)
                    {
                        if (!Array.from(this.element.options).some(o => o.value === value))
                        {
                            this.element.insertAdjacentElement('afterbegin', new Option(value, value, true, true));

                            this.element.dispatchEvent(new CustomEvent('change'));

                            this.dropdownSearch.value = '';

                            this.dropdownSearch.dispatchEvent(new Event('keyup'));
                        }
                    }
                }
            }
        };

        const searchAjax = (value, minlength) =>
        {
            if (value.length >= minlength)
            {
                this.element.querySelectorAll('*').forEach((option) =>
                {
                    option.remove();
                });
                
                this.element.insertAdjacentElement('afterbegin', new Option('', '', false, false));
                
                fetch(this.options.ajax.url + '?' + new URLSearchParams(this.options.ajax.createParameters(value))).then(response => response.json()).then(results =>
                {
                    if (results)
                    {
                        for (const [value, text] of Object.entries(results))
                        {
                            this.element.insertAdjacentElement('afterbegin', new Option(text, value, false, false));
                        }
                    }
                }).finally(() =>
                {
                    this.element.dispatchEvent(new CustomEvent('change'));
                });
            }
        };

        const search = (event, filterValue, minlength) =>
        {
            const headers = Array.from(this.dropdownMenu.querySelectorAll('h6.dropdown-header'));
            const items = Array.from(this.dropdownMenu.querySelectorAll('button.dropdown-item'));
            const noResults = this.dropdownMenu.querySelector('span.dropdown-item');

            if (headers.length)
            {
                headers.forEach((header) =>
                {
                    header.style.display = 'none';
                });
            }

            if (items.length)
            {
                items.forEach((item) =>
                {
                    const filterText = item.textContent.toLowerCase();
                    const isVisible = filterText.includes(filterValue);

                    item.style.display = (isVisible ? 'block' : 'none');

                    if (isVisible)
                    {
                        if (headers.length > 0)
                        {
                            let current = item.previousElementSibling;
                            while (current)
                            {
                                if (current.classList.contains('dropdown-header'))
                                {
                                    current.style.display = '';
                                    break;
                                }
                                current = current.previousElementSibling;
                            }
                        }
                    }
                });
            }

            if (headers.length)
            {
                headers.forEach((header) =>
                {
                    const filterText = header.textContent.toLowerCase();
                    const isVisible = filterText.includes(filterValue);

                    if (isVisible)
                    {
                        header.style.display = '';

                        let current = header.nextElementSibling;
                        while (current && !current.classList.contains('dropdown-header'))
                        {
                            current.style.display = '';
                            current = current.nextElementSibling;
                        }
                    }
                });
            }

            const foundItems = items.filter((item) => ((item.style.display !== 'none') && !item.hasAttribute('hidden')));

            if (foundItems.length === 0)
            {
                if (noResults)
                {
                    noResults.style.display = '';

                    if (this.options.create)
                    {
                        if (this.dropdownSearch)
                        {
                            if (this.dropdownSearch.value)
                            {
                                noResults.textContent = this.options.lang.searchAddPlaceholder.replace('[search-value]', this.dropdownSearch.value);

                                if (event.key === 'Enter')
                                {
                                    create();
                                }
                            }
                        }
                    }
                    else
                    {
                        noResults.textContent = this.options.lang.noResults;

                        if (filterValue.length < minlength)
                        {
                            noResults.textContent = this.options.lang.typeSearch.replace('[length]', (minlength - filterValue.length));
                        }
                    }
                }
            }
            else
            {
                if (noResults)
                {
                    noResults.style.display = 'none';
                    noResults.textContent = this.options.lang.noResults;
                }

                if (foundItems.length === 1)
                {
                    if (event.key === 'Enter')
                    {
                        foundItems.forEach((item) =>
                        {
                            item.click();
                            
                            if (this.dropdownSearch)
                            {
                                this.dropdownSearch.value = '';
                            }
                        });
                    }
                }
            }
        };
        
        const removeLastSelectedTag = () =>
        {
            if (this.element.selectedOptions.length)
            {
                if (this.element.multiple)
                {
                    const option = Array.from(this.element.selectedOptions).reverse().find((opt) => (opt.hasAttribute('value') && opt.value !== ''));

                    if (option)
                    {
                        option.selected = false;
                    }
                }
                else
                {
                    this.element.value = '';
                }
                
                this.element.dispatchEvent(new CustomEvent('change'));

                this.dropdownButton.click();
                
                if (this.dropdownSearch)
                {
                    this.dropdownSearch.value = '';
                }
            }
        };

        const removeSelectedTag = (tag) =>
        {
            if (this.element.selectedOptions.length)
            {
                const option = Array.from(this.element.selectedOptions).find((opt) => opt.value === tag.value);

                if (option)
                {
                    option.selected = false;
                }

                this.element.dispatchEvent(new CustomEvent('change'));

                this.dropdownButton.click();
                
                if (this.dropdownSearch)
                {
                    this.dropdownSearch.value = '';
                }
            }
        };

        const update = (item) =>
        {
            if (!this.element.multiple)
            {
                this.element.value = item.value;
            }
            else
            {
                Array.from(this.element.options).filter((option) => option.value === item.value)[0].selected = true;
            }

            if (!this.element.multiple)
            {
                this.dropdownButton.click();
            }

            this.element.dispatchEvent(new CustomEvent('change'));

            this.dropdownButton.focus();

            if (this.dropdownSearch)
            {
                this.dropdownSearch.value = '';
                this.dropdownSearch.focus();
            }
        };

        const clearSelected = () =>
        {
            if (this.element.value)
            {
                if (this.dropdownSearch)
                {
                    Array.from(this.element.options).forEach((option) =>
                    {
                        option.selected = false;
                    });

                    this.element.value = (this.element.multiple) ? [] : '';

                }
                else
                {
                    this.element.selectedIndex = 0;
                }
                
                this.element.dispatchEvent(new CustomEvent('change'));
            }
        };

        const getPlaceholder = () =>
        {
            const placeholder = this.element.getAttribute('placeholder');
            
            if (placeholder)
            {
                return placeholder;
            }
            
            const option = Array.from(this.element.options).filter((option) => (option.value === '' || !option.hasAttribute('value')));
            
            if (option.length > 0)
            {
                if (option[0].textContent.length)
                {
                    return option[0].textContent;
                }
            }
            
            if (this.options.ajax)
            {
                return this.options.lang.typeSearch.replace('[length]', this.options.searchMinLength || 3);
            }
            
            if (this.element.multiple)
            {
                return this.options.lang.placeholderMultiple;
            }
            else
            {
                return this.options.lang.placeholder;
            }
            
            
            return '';
        };
        
        const updateDropdown = () =>
        {
            if (this.dropdown)
            {
                const selectedItems = getSelectedItems();
                
                if (this.dropdownButton)
                {
                    Array.from(this.dropdownButton.querySelectorAll('data')).forEach((item) =>
                    {
                        item.remove();
                    });
                    
                    this.dropdownButton.insertAdjacentHTML('afterbegin', selectedItems);
                }

                if (this.dropdownMenu)
                {
                    const items = getItems();
                    
                    this.dropdownMenu.innerHTML = items.join('');
                    this.dropdownMenu.innerHTML += getNoResults();
                }
                
                if (this.dropdownSearch)
                {
                    const text = (selectedItems.length <= 0) ? getPlaceholder() : '';
                    
                    if (this.dropdownSearch.tagName === 'INPUT')
                    {
                        this.dropdownSearch.value = '';
                        
                        this.dropdownSearch.placeholder = text;
                    }
                    else
                    {
                        this.dropdownSearch.textContent = text;
                    }
                }
            }
        };

        const getSelectedItems = () =>
        {
            let items = '';
            
            if (this.element.multiple)
            {
                const selectedOptions = Array.from(this.element.options).filter((option) => (option.selected && option.getAttribute('value')));

                if (selectedOptions.length)
                {
                    selectedOptions.forEach((option) =>
                    {
                        items += `<data class="badge text-bg-primary" value="${option.value}">${option.textContent} <span class="${this.options.icon.removeTag} ms-1"></span></data>`;
                    });
                }
            }
            else
            {
                if (this.element.options.selectedIndex !== -1)
                {
                    const option = this.element.options[this.element.options.selectedIndex];
                    
                    if (option)
                    {
                        if (option.getAttribute('value'))
                        {
                            items += `<data class="text-body-primary" value="${option.value}">${option.textContent}</data>`;
                        }
                    }
                }
            }

            return items;
        };

        const getItems = () =>
        {
            let items = [];
            
            const list = this.element.querySelectorAll('*');
            
            if (list)
            {
                Array.from(list).forEach((option) =>
                {
                    if (option.tagName === 'OPTGROUP')
                    {
                        items.push(`<h6 class="dropdown-header">${option.label}</h6>`);
                    }
                    else if (option.tagName === 'OPTION')
                    {
                        if (this.options.hideSelected && option.selected)
                        {
                            return;
                        }

                        const selected = option.selected ? 'active' : '';
                        const disabled = (option.disabled || option.selected) ? 'disabled' : '';
                        const hidden   = ((!option.hasAttribute('value') || option.value === '') ? 'hidden' : '');

                        items.push(`<button type="button" value="${option.value}" class="dropdown-item ${selected}" ${hidden} ${disabled}>${option.textContent}</button>`);
                    }
                });                
            }
            
            return items;
        };

        const getNoResults = () =>
        {
            let label = this.options.lang.noResults;
            
            if (this.dropdownSearch)
            {
                if (this.dropdownSearch.tagName === 'INPUT')
                {
                    if (this.dropdownSearch.value < this.options.searchMinLength)
                    {
                        label = this.options.lang.typeSearch.replace('[length]', (this.options.searchMinLength - this.dropdownSearch.value.length));
                    }
                }
            }
            
            const options = Array.from(this.element.options).filter((option) => (option.value !== '' && option.textContent !== ''));
            
            return `<span ${options.length > 0 ? 'style="display:none;"' : ''} class="dropdown-item text-body-secondary">${label}</span>`;
        };

        const getClearButton = () =>
        {
            if (this.options.clear)
            {
                if (!this.element.multiple)
                {
                    return `<button type="button" class="btn btn-sm bs-clear" title="${this.options.lang.clearSelect}"><span class="${this.options.icon.clear}"></span></button>`;
                }
            }

            return '';
        };

        const getSearchInput = () =>
        {
            const placeHolder = (this.element.value <= 0) ? getPlaceholder() : '';
            
            if (this.options.search || this.options.create)
            {
                return `<input type="text" class="bs-input" placeholder="${placeHolder}" autocomplete="off">`;
            }
            
            return `<div class="bs-input text-muted">${placeHolder}</div>`;
        };

        const getDropdownButton = () =>
        {
            if (!this.element.classList.contains('form-select'))
            {
                this.element.classList.add('form-select');
            }
            
            const button = `<div class="${this.element.className}" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="${this.options.autoClose}">`
            + getSelectedItems()
            + getSearchInput()
            + `</div>`;
            
            return button;
        };

        const createClearButton = () =>
        {
            if (this.dropdownClearButton)
            {
                this.dropdownClearButton.addEventListener('click', clearSelected);
            }
        };
        
        const createTags = () =>
        {
            if (this.dropdownButton)
            {   
                this.dropdownButton.addEventListener('click', (event) =>
                {
                    if (event.target.tagName === 'SPAN')
                    {
                        removeSelectedTag(event.target.closest('data'));
                    }
                });  
            }
        };

        const createSearch = () =>
        {
            if (this.dropdown)
            {
                if (this.dropdownSearch && this.dropdownSearch.tagName === 'INPUT')
                {
                    if (this.dropdownButton && this.dropdownMenu)
                    {
                        this.debouncedSearch = debounceFunction((event) =>
                        {
                            if (!this.dropdownButton.classList.contains('show'))
                            {
                                this.dropdownButton.click();
                            }

                            if (this.options.ajax)
                            {
                                searchAjax(this.dropdownSearch.value, (this.options.searchMinLength || 3));
                            }
                            else
                            {
                                search(event, this.dropdownSearch.value.toLowerCase().trim(), (this.options.searchMinLength || 3));
                            }
                        }, this.options.debounceSearch || 300);
                    }

                    this.dropdown.addEventListener('shown.bs.dropdown', () =>
                    {
                        this.dropdownSearch.focus();
                    });

                    this.dropdownSearch.addEventListener('keydown', (event) =>
                    {
                        if (event.key === 'Enter')
                        {
                            event.preventDefault();
                            return false;
                        }
                        
                        if (event.key === 'Backspace')
                        {
                            if (this.options.clearBackspace)
                            {
                                if (!this.dropdownSearch.value)
                                {
                                    removeLastSelectedTag();

                                    event.preventDefault();
                                    return false;
                                }
                            }
                        }
                    });

                    this.dropdownSearch.addEventListener('keyup', this.debouncedSearch);
                }
            }
        };

        const createDropdown = () =>
        {
            const items = getItems();

            const dropdown = `<div class="dropdown bs-wrapper">`
            + getDropdownButton()
            + `<div class="dropdown-menu" style="max-height:${this.options.maxHeight};overflow-y:auto;">`
            + items.join('')
            + getNoResults()
            + `</div>`
            + getClearButton()
            + `</div>`;

            if (this.element.nextElementSibling)
            {
                this.element.nextElementSibling.remove();
            }

            this.element.insertAdjacentHTML('afterend', dropdown);
            
            if (this.element.nextElementSibling)
            {
                const dropdownMenu = this.element.nextElementSibling.querySelector('.dropdown-menu');

                if (dropdownMenu)
                {
                    dropdownMenu.addEventListener('click', (event) =>
                    {
                        if (event.target)
                        {
                            if (event.target.tagName === 'BUTTON')
                            {
                                update(event.target);
                            }
                        }
                    });
                }
            }
            
            return this.element.nextElementSibling;
        };

        const init = () =>
        {
            this.element.style.display = 'none';
            
            this.options.create = (this.options.create && !this.options.ajax);

            this.dropdown = createDropdown();
            
            this.dropdownButton = this.dropdown.querySelector('.form-select');
            
            this.dropdownSearch = this.dropdownButton.querySelector('.bs-input');
            
            this.dropdownClearButton = this.dropdown.querySelector('.bs-clear');   
            
            this.dropdownMenu = this.dropdown.querySelector('.dropdown-menu');

            createSearch();
            
            createTags();

            createClearButton();

            this.element.addEventListener('change', updateDropdown);  
            
            return this;
        };
        
        this.destroy = () =>
        {
            if (this.dropdown)
            {
                if (this.dropdown.parentNode)
                {
                    this.dropdown.remove();
                }

                this.element.removeEventListener('change', updateDropdown);

                this.element.style.display = '';

                this.dropdown = null;
            }
        };
        
        this.refresh = () =>
        {
            this.element.dispatchEvent(new CustomEvent('change'));
        };
        
        this.set = (value) =>
        {
            if (this.element)
            {
                if (value)
                {
                    const isArray = Array.isArray(value);

                    Array.from(this.element.options).forEach((option) =>
                    {
                        if (isArray)
                        {
                            option.selected = value.includes(option.value);
                        }
                        else
                        {
                            option.selected = (option.value === value);
                        }
                    });
                    
                    this.element.dispatchEvent(new CustomEvent('change'));
                }
                else
                {
                    clearSelected();
                }

            }
        };
        
        this.get = () =>
        {
            if (this.element.multiple)
            {
                if (this.element.selectedOptions)
                {
                    return Array.from(this.element.selectedOptions).map(({ value }) => value);
                }
            }
            else
            {
                if (this.element.options.selectedIndex !== -1)
                {
                    const option = this.element.options[this.element.options.selectedIndex];

                    if (option)
                    {
                        return option.value;
                    }
                }
            }
            
            return '';
        }
        
        this.toggle = (value, selected) =>
        {
            if (this.element)
            {
                if (value)
                {
                    const isArray = Array.isArray(value);

                    Array.from(this.element.options).forEach((option) =>
                    {
                        if (isArray)
                        {
                            if (value.includes(option.value))
                            {
                                option.selected = selected;
                            }
                        }
                        else
                        {
                            if (option.value === value)
                            {
                                option.selected = selected;
                            }
                        }
                    });
                    
                    this.element.dispatchEvent(new CustomEvent('change'));
                }
            }
        };
        
        this.add = (text, value, defaultSelected, selected) =>
        {
            this.element.append(new Option(text, value, defaultSelected, selected));
            
            this.element.dispatchEvent(new CustomEvent('change'));
        };
        
        this.remove = (value) =>
        {
            if (value)
            {
                for (let i = 0; i < this.element.length; i++)
                {
                    if (this.element.options[i].value === value)
                    {
                        this.element.remove(i);
                    }
                }
                
                this.element.dispatchEvent(new CustomEvent('change'));
            }
        };
        
        this.clear = () =>
        {
            clearSelected();
        };

        return init();
    }

    window.bsSelect = bsSelect;
})();
