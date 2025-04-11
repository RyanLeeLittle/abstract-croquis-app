document.addEventListener('DOMContentLoaded', function() {
    // 모드 전환 버튼
    const abstractModeBtn = document.getElementById('abstract-mode-btn');
    const croquisModeBtn = document.getElementById('croquis-mode-btn');
    const abstractMode = document.getElementById('abstract-mode');
    const croquisMode = document.getElementById('croquis-mode');

    // 추상화 모드 버튼 클릭
    abstractModeBtn.addEventListener('click', function() {
        abstractModeBtn.classList.add('active');
        croquisModeBtn.classList.remove('active');
        abstractMode.classList.add('active');
        croquisMode.classList.remove('active');
    });

    // 크로키 모드 버튼 클릭
    croquisModeBtn.addEventListener('click', function() {
        croquisModeBtn.classList.add('active');
        abstractModeBtn.classList.remove('active');
        croquisMode.classList.add('active');
        abstractMode.classList.remove('active');
        
        // 크로키 캔버스 설정
        setupCroquisCanvas();
    });

    // 추상화 관련 기능 설정
    setupAbstractCanvas();
    
    // 크로키 관련 기능 설정
    if (croquisMode.classList.contains('active')) {
        setupCroquisCanvas();
    }
});

// 추상화 캔버스 설정 함수
function setupAbstractCanvas() {
    // Canvas setup
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'free';
    let currentColor = '#FF4136';
    let startX, startY;
    // 커서 크기를 추적할 변수
    let cursorSize = 10;
    // 마지막 캔버스 상태 저장 변수
    let canvasHistory = [];
    let currentHistoryIndex = -1;
    
    // 캔버스 해상도 조정 (픽셀 정확도를 위해)
    function setupCanvas() {
        // 캔버스의 실제 크기를 CSS 크기에 맞게 조정
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.imageSmoothingEnabled = false; // 픽셀 렌더링 향상
    }
    
    // 초기 캔버스 설정
    setupCanvas();
    
    // 창 크기 변경 시 캔버스 조정
    window.addEventListener('resize', setupCanvas);

    // Tool buttons
    const circleBtn = document.getElementById('circle-btn');
    const squareBtn = document.getElementById('square-btn');
    const triangleBtn = document.getElementById('triangle-btn');
    const lineBtn = document.getElementById('line-btn');
    const freeBtn = document.getElementById('free-btn');
    const colorPicker = document.getElementById('color-picker');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');

    // Tool selection
    const tools = [circleBtn, squareBtn, triangleBtn, lineBtn, freeBtn];

    tools.forEach(tool => {
        tool.addEventListener('click', function() {
            // Remove active class from all tools
            tools.forEach(t => t.classList.remove('active'));
            // Add active class to selected tool
            this.classList.add('active');
            
            // Set current tool based on button id
            currentTool = this.id.replace('-btn', '');
            
            // 커서 크기 업데이트
            updateCursor();
        });
    });

    // 커서 스타일 업데이트 함수
    function updateCursor() {
        // 커서 이미지 만들기
        const cursorCanvas = document.createElement('canvas');
        const cursorCtx = cursorCanvas.getContext('2d');
        
        cursorCanvas.width = cursorSize * 2;
        cursorCanvas.height = cursorSize * 2;
        
        // 투명 배경 (중요: 커서가 더 정확하게 보이도록)
        cursorCtx.clearRect(0, 0, cursorSize * 2, cursorSize * 2);
        
        // 십자선 그리기 (더 얇고 정확하게)
        cursorCtx.beginPath();
        cursorCtx.moveTo(cursorSize, 0);
        cursorCtx.lineTo(cursorSize, cursorSize * 2);
        cursorCtx.moveTo(0, cursorSize);
        cursorCtx.lineTo(cursorSize * 2, cursorSize);
        cursorCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        cursorCtx.lineWidth = 1;
        cursorCtx.stroke();
        
        // 중앙점 표시 (작은 원)
        cursorCtx.beginPath();
        cursorCtx.arc(cursorSize, cursorSize, 2, 0, Math.PI * 2);
        cursorCtx.fillStyle = 'red';
        cursorCtx.fill();
        
        // 커서 스타일 적용 (정확한 중앙점 지정)
        const cursorUrl = cursorCanvas.toDataURL();
        canvas.style.cursor = `url('${cursorUrl}') ${cursorSize} ${cursorSize}, crosshair`;
    }

    // Set initial active tool
    freeBtn.classList.add('active');
    updateCursor();

    // Color picker
    colorPicker.addEventListener('input', function() {
        currentColor = this.value;
    });

    // 현재 캔버스 상태를 저장하는 함수
    function saveCanvasState() {
        // 기록 추가 전에 현재 이후의 기록은 제거
        if (currentHistoryIndex < canvasHistory.length - 1) {
            canvasHistory = canvasHistory.slice(0, currentHistoryIndex + 1);
        }
        // 캔버스 현재 상태 저장
        const imageData = canvas.toDataURL();
        canvasHistory.push(imageData);
        currentHistoryIndex = canvasHistory.length - 1;
        
        // 히스토리 크기 제한 (메모리 관리)
        if (canvasHistory.length > 10) {
            canvasHistory.shift();
            currentHistoryIndex--;
        }
    }

    // 저장된 캔버스 상태 복원
    function restoreCanvasState(index) {
        if (index >= 0 && index < canvasHistory.length) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = canvasHistory[index];
            currentHistoryIndex = index;
        }
    }

    // Clear button
    clearBtn.addEventListener('click', function() {
        // 클리어 전 현재 상태 저장
        saveCanvasState();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 클리어 후 상태 저장
        saveCanvasState();
    });

    // Save button
    saveBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = '나의_추상화.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    // 정확한 마우스 위치 계산을 위한 함수
    function getExactMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        // devicePixelRatio를 고려한 정확한 위치 계산
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
        
        if (!clientX || !clientY) return null;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    // Mouse events for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    function startDrawing(e) {
        isDrawing = true;
        const pos = getExactMousePosition(e);
        if (!pos) return;
        
        startX = pos.x;
        startY = pos.y;
        
        // 그리기 시작 전 캔버스 상태 저장
        saveCanvasState();
        
        // For free drawing, start a new path
        if (currentTool === 'free') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const pos = getExactMousePosition(e);
        if (!pos) return;
        
        const x = pos.x;
        const y = pos.y;
        
        if (currentTool === 'free') {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    function stopDrawing(e) {
        if (!isDrawing) return;
        
        const pos = getExactMousePosition(e);
        if (!pos) {
            isDrawing = false;
            return;
        }
        
        const endX = pos.x;
        const endY = pos.y;
        
        ctx.fillStyle = currentColor;
        ctx.strokeStyle = currentColor;
        
        // Draw shapes based on current tool
        switch (currentTool) {
            case 'circle':
                drawCircle(startX, startY, endX, endY);
                break;
            case 'square':
                drawSquare(startX, startY, endX, endY);
                break;
            case 'triangle':
                drawTriangle(startX, startY, endX, endY);
                break;
            case 'line':
                drawLine(startX, startY, endX, endY);
                break;
        }
        
        isDrawing = false;
        
        // 그리기 완료 후 캔버스 상태 저장
        saveCanvasState();
    }

    // Touch event handlers
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        startDrawing({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        draw({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        // 마지막 위치 정보가 없으므로 현재 상태에서 그리기 종료
        if (isDrawing) {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                stopDrawing({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            } else {
                // 터치 좌표가 없는 경우
                isDrawing = false;
                saveCanvasState();
            }
        }
    }

    // Drawing functions
    function drawCircle(startX, startY, endX, endY) {
        // 중심점 기준으로 그리기
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawSquare(startX, startY, endX, endY) {
        // 중심점 기준으로 사각형 그리기
        const width = endX - startX;
        const height = endY - startY;
        
        // 정사각형일 경우 (shift 키 누른 것처럼 처리)
        if (Math.abs(width) === Math.abs(height)) {
            ctx.fillRect(startX - width/2, startY - height/2, width, height);
        } else {
            // 마우스 위치를 중심으로 사각형 그리기
            ctx.fillRect(startX - width/2, startY - height/2, width, height);
        }
    }

    function drawTriangle(startX, startY, endX, endY) {
        // 마우스 시작점을 중앙으로 삼각형 그리기
        const width = (endX - startX) * 2;
        const height = (endY - startY) * 2;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY - height/2); // 상단 꼭지점
        ctx.lineTo(startX + width/2, startY + height/2); // 우측 하단
        ctx.lineTo(startX - width/2, startY + height/2); // 좌측 하단
        ctx.closePath();
        ctx.fill();
    }

    function drawLine(startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // 초기 캔버스 상태 저장
    saveCanvasState();

    // Example images preload
    loadExampleImages();
}

// 크로키 캔버스 설정 함수
function setupCroquisCanvas() {
    const canvas = document.getElementById('croquis-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'pencil';
    let lineThickness = 3;
    let timer = null;
    let timeLeft = 0;
    // 캔버스 상태 저장 변수
    let canvasHistory = [];
    let currentHistoryIndex = -1;
    
    // 캔버스 해상도 조정
    function setupCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.imageSmoothingEnabled = false;
    }
    
    // 초기 캔버스 설정
    setupCanvas();
    
    // 창 크기 변경 시 캔버스 조정
    window.addEventListener('resize', setupCanvas);
    
    // 도구 버튼
    const pencilBtn = document.getElementById('pencil-btn');
    const charcoalBtn = document.getElementById('charcoal-btn');
    const penBtn = document.getElementById('pen-btn');
    const eraserBtn = document.getElementById('eraser-btn');
    const thicknessSlider = document.getElementById('thickness-slider');
    const clearBtn = document.getElementById('croquis-clear-btn');
    const saveBtn = document.getElementById('croquis-save-btn');
    
    // 타이머 버튼
    const timer30sBtn = document.getElementById('timer-30s');
    const timer1mBtn = document.getElementById('timer-1m');
    const timer5mBtn = document.getElementById('timer-5m');
    const timerStopBtn = document.getElementById('timer-stop');
    const timerDisplay = document.getElementById('timer-display');
    
    // 참고 이미지 버튼
    const refPersonBtn = document.getElementById('ref-person');
    const refAnimalBtn = document.getElementById('ref-animal');
    const refObjectBtn = document.getElementById('ref-object');
    const refNextBtn = document.getElementById('ref-next');
    const referenceImage = document.getElementById('reference-image');
    
    // 도구 선택
    const tools = [pencilBtn, charcoalBtn, penBtn, eraserBtn];
    
    tools.forEach(tool => {
        if (!tool) return;
        
        tool.addEventListener('click', function() {
            // 모든 도구에서 active 클래스 제거
            tools.forEach(t => t.classList.remove('active'));
            // 선택한 도구에 active 클래스 추가
            this.classList.add('active');
            
            // 도구 ID에 따라 현재 도구 설정
            currentTool = this.id.replace('-btn', '');
        });
    });
    
    // 선 굵기 조절
    if (thicknessSlider) {
        thicknessSlider.addEventListener('input', function() {
            lineThickness = parseInt(this.value);
        });
    }
    
    // 초기 도구 선택
    if (pencilBtn) {
        pencilBtn.classList.add('active');
    }
    
    // 현재 캔버스 상태를 저장하는 함수
    function saveCanvasState() {
        // 기록 추가 전에 현재 이후의 기록은 제거
        if (currentHistoryIndex < canvasHistory.length - 1) {
            canvasHistory = canvasHistory.slice(0, currentHistoryIndex + 1);
        }
        // 캔버스 현재 상태 저장
        const imageData = canvas.toDataURL();
        canvasHistory.push(imageData);
        currentHistoryIndex = canvasHistory.length - 1;
        
        // 히스토리 크기 제한 (메모리 관리)
        if (canvasHistory.length > 10) {
            canvasHistory.shift();
            currentHistoryIndex--;
        }
    }

    // 저장된 캔버스 상태 복원
    function restoreCanvasState(index) {
        if (index >= 0 && index < canvasHistory.length) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = canvasHistory[index];
            currentHistoryIndex = index;
        }
    }
    
    // 지우기 버튼
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            // 클리어 전 현재 상태 저장
            saveCanvasState();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 클리어 후 상태 저장
            saveCanvasState();
        });
    }
    
    // 저장 버튼
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const link = document.createElement('a');
            link.download = '나의_크로키.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }
    
    // 타이머 기능
    function startTimer(seconds) {
        // 이전 타이머 중지
        clearInterval(timer);
        
        timeLeft = seconds;
        updateTimerDisplay();
        
        timer = setInterval(function() {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('시간이 종료되었습니다! 다른 참고 이미지로 새로운 크로키를 시작해보세요.');
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 타이머 버튼 이벤트
    if (timer30sBtn) {
        timer30sBtn.addEventListener('click', function() {
            startTimer(30);
        });
    }
    
    if (timer1mBtn) {
        timer1mBtn.addEventListener('click', function() {
            startTimer(60);
        });
    }
    
    if (timer5mBtn) {
        timer5mBtn.addEventListener('click', function() {
            startTimer(300);
        });
    }
    
    if (timerStopBtn) {
        timerStopBtn.addEventListener('click', function() {
            clearInterval(timer);
            timerDisplay.textContent = '00:00';
        });
    }
    
    // 정확한 마우스 위치 계산
    function getExactMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
        
        if (!clientX || !clientY) return null;
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    // 그리기 시작
    function startDrawing(e) {
        isDrawing = true;
        const pos = getExactMousePosition(e);
        if (!pos) return;
        
        lastX = pos.x;
        lastY = pos.y;
        
        // 그리기 시작 전 캔버스 상태 저장
        saveCanvasState();
    }
    
    // 그리기
    function draw(e) {
        if (!isDrawing) return;
        
        const pos = getExactMousePosition(e);
        if (!pos) return;
        
        const currentX = pos.x;
        const currentY = pos.y;
        
        // 도구에 따른 스타일 설정
        setDrawingStyle();
        
        // 선 그리기
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // 현재 위치 업데이트
        lastX = currentX;
        lastY = currentY;
    }
    
    // 그리기 스타일 설정
    function setDrawingStyle() {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        switch (currentTool) {
            case 'pencil':
                ctx.globalAlpha = 0.8;
                ctx.lineWidth = lineThickness;
                ctx.strokeStyle = '#333333';
                break;
            case 'charcoal':
                ctx.globalAlpha = 0.5;
                ctx.lineWidth = lineThickness * 1.5;
                ctx.strokeStyle = '#000000';
                break;
            case 'pen':
                ctx.globalAlpha = 1;
                ctx.lineWidth = lineThickness * 0.8;
                ctx.strokeStyle = '#000000';
                break;
            case 'eraser':
                ctx.globalAlpha = 1;
                ctx.lineWidth = lineThickness * 2;
                ctx.strokeStyle = '#FFFFFF';
                break;
        }
    }
    
    // 그리기 종료
    function stopDrawing(e) {
        if (!isDrawing) return;
        
        // 그리기 종료 후 캔버스 상태 저장
        saveCanvasState();
        isDrawing = false;
    }
    
    // 마우스 이벤트
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 터치 이벤트 처리
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            draw({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        // 마지막 터치 위치 가져오기
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            stopDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        } else {
            // 터치 좌표가 없는 경우
            isDrawing = false;
            saveCanvasState(); // 어쨌든 상태 저장
        }
    }, { passive: false });
    
    canvas.addEventListener('touchcancel', function(e) {
        e.preventDefault();
        isDrawing = false;
        saveCanvasState(); // 상태 저장
    }, { passive: false });
    
    // 참고 이미지 관련 변수
    let currentCategory = 'person';
    let currentImageIndex = 1;
    const maxImages = {
        person: 3,
        animal: 3,
        object: 3
    };
    
    // 참고 이미지 변경 함수
    function changeReferenceImage() {
        referenceImage.src = `images/reference/${currentCategory}${currentImageIndex}.jpg`;
    }
    
    // 참고 이미지 카테고리 변경
    if (refPersonBtn) {
        refPersonBtn.addEventListener('click', function() {
            currentCategory = 'person';
            currentImageIndex = 1;
            changeReferenceImage();
        });
    }
    
    if (refAnimalBtn) {
        refAnimalBtn.addEventListener('click', function() {
            currentCategory = 'animal';
            currentImageIndex = 1;
            changeReferenceImage();
        });
    }
    
    if (refObjectBtn) {
        refObjectBtn.addEventListener('click', function() {
            currentCategory = 'object';
            currentImageIndex = 1;
            changeReferenceImage();
        });
    }
    
    // 다음 참고 이미지
    if (refNextBtn) {
        refNextBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex % maxImages[currentCategory]) + 1;
            changeReferenceImage();
        });
    }
    
    // 참고 이미지 폴더가 없을 경우를 대비한 오류 처리
    if (referenceImage) {
        referenceImage.onerror = function() {
            // 이미지 로드 실패 시 캔버스로 대체 이미지 생성
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            
            // 배경
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, 400, 300);
            
            // 카테고리에 따른 대체 이미지 생성
            if (currentCategory === 'person') {
                drawHumanFigureCroquis(ctx);
            } else if (currentCategory === 'animal') {
                drawAnimalCroquis(ctx);
            } else {
                drawObjectCroquis(ctx);
            }
            
            // 대체 이미지 적용
            referenceImage.src = canvas.toDataURL();
        };
    }
    
    // 참고 이미지 폴더 생성 안내
    console.log('크로키 모드를 위해 "images/reference" 폴더를 생성하고 다음과 같은 이미지를 추가하세요: person1.jpg, person2.jpg, person3.jpg, animal1.jpg, animal2.jpg, animal3.jpg, object1.jpg, object2.jpg, object3.jpg');
    
    // 초기 참고 이미지 오류 처리 트리거
    if (referenceImage) {
        referenceImage.src = 'images/reference/person1.jpg';
    }
    
    // 초기 캔버스 상태 저장
    saveCanvasState();
}

// Function to load SVG placeholders until real images are available
function loadExampleImages() {
    // Example 1: Geometric abstraction
    createSVGExample('example1', [
        {type: 'circle', fill: '#3498db', cx: 50, cy: 50, r: 30},
        {type: 'rect', fill: '#e74c3c', x: 30, y: 70, width: 40, height: 40},
        {type: 'polygon', fill: '#2ecc71', points: '90,40 120,70 70,90'}
    ]);
    
    // Example 2: Color abstraction
    createSVGExample('example2', [
        {type: 'rect', fill: '#f1c40f', x: 20, y: 20, width: 80, height: 80},
        {type: 'rect', fill: '#e67e22', x: 60, y: 40, width: 60, height: 60},
        {type: 'rect', fill: '#9b59b6', x: 40, y: 60, width: 40, height: 40}
    ]);
    
    // Example 3: Nature abstraction
    createSVGExample('example3', [
        {type: 'rect', fill: '#27ae60', x: 0, y: 80, width: 120, height: 40},
        {type: 'circle', fill: '#f39c12', cx: 100, cy: 30, r: 20},
        {type: 'polygon', fill: '#2c3e50', points: '30,80 60,20 90,80'}
    ]);
    
    // 학생 작품 이미지 생성 및 표시
    createStudentImage1();
    createStudentImage2();
    createStudentImage3();
    
    // 크로키 예시 이미지
    createCroquisExamples();
}

// 크로키 예시 이미지 생성
function createCroquisExamples() {
    createCroquisExample('croquis-example1', 'images/croquis1.png', '인물 크로키');
    createCroquisExample('croquis-example2', 'images/croquis2.png', '동물 크로키');
    createCroquisExample('croquis-example3', 'images/croquis3.png', '사물 크로키');
    
    createCroquisStudentImage('크로키 학생 작품 1', 'images/croquis-student1.png');
    createCroquisStudentImage('크로키 학생 작품 2', 'images/croquis-student2.png');
    createCroquisStudentImage('크로키 학생 작품 3', 'images/croquis-student3.png');
}

function createSVGExample(elementId, shapes) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Remove any existing image
    const existingImg = container.querySelector('img');
    if (existingImg) {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '120');
        svg.setAttribute('viewBox', '0 0 120 120');
        
        // Add shapes to SVG
        shapes.forEach(shape => {
            const element = document.createElementNS('http://www.w3.org/2000/svg', shape.type);
            
            // Set attributes based on shape type
            for (const [key, value] of Object.entries(shape)) {
                if (key !== 'type') {
                    element.setAttribute(key, value);
                }
            }
            
            svg.appendChild(element);
        });
        
        // Replace image with SVG
        container.replaceChild(svg, existingImg);
    }
}

// 학생 작품 1: 기하학적 풍경
function createStudentImage1() {
    const img = document.querySelector('.gallery-item img[alt="학생 작품 1"]');
    if (!img) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // 배경 - 하늘
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 220, 120);
    
    // 땅
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 120, 220, 60);
    
    // 산
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(80, 40);
    ctx.lineTo(150, 120);
    ctx.closePath();
    ctx.fill();
    
    // 두 번째 산
    ctx.fillStyle = '#006400';
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(180, 60);
    ctx.lineTo(240, 120);
    ctx.closePath();
    ctx.fill();
    
    // 집
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(160, 90, 40, 30);
    
    // 지붕
    ctx.fillStyle = '#A52A2A';
    ctx.beginPath();
    ctx.moveTo(155, 90);
    ctx.lineTo(180, 70);
    ctx.lineTo(205, 90);
    ctx.closePath();
    ctx.fill();
    
    // 창문
    ctx.fillStyle = '#ADD8E6';
    ctx.fillRect(170, 95, 10, 10);
    ctx.fillRect(185, 95, 10, 10);
    
    // 문
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(175, 110, 10, 10);
    
    // 태양
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(40, 40, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 이미지 설정
    img.src = canvas.toDataURL('image/png');
    
    // 캡션 설정
    const caption = img.nextElementSibling;
    if (caption) {
        caption.textContent = '기하학적 풍경';
    }
}

// 학생 작품 2: 색상의 향연
function createStudentImage2() {
    const img = document.querySelector('.gallery-item img[alt="학생 작품 2"]');
    if (!img) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // 배경
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, 220, 180);
    
    // 원형 패턴들
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
    
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 220;
        const y = Math.random() * 180;
        const radius = Math.random() * 25 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 투명도를 주어 색상이 겹치도록
        ctx.globalAlpha = 0.7;
    }
    
    // 투명도 초기화
    ctx.globalAlpha = 1;
    
    // 이미지 설정
    img.src = canvas.toDataURL('image/png');
    
    // 캡션 설정
    const caption = img.nextElementSibling;
    if (caption) {
        caption.textContent = '색상의 향연';
    }
}

// 학생 작품 3: 도시의 밤
function createStudentImage3() {
    const img = document.querySelector('.gallery-item img[alt="학생 작품 3"]');
    if (!img) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // 밤하늘 배경
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, 220, 180);
    
    // 별
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 220;
        const y = Math.random() * 80;
        const size = Math.random() * 1.5 + 0.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 달
    ctx.fillStyle = '#FFFFCC';
    ctx.beginPath();
    ctx.arc(180, 30, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 빌딩들
    const buildingCount = 11;
    const buildingWidth = 220 / buildingCount;
    
    for (let i = 0; i < buildingCount; i++) {
        const height = Math.random() * 80 + 40;
        const x = i * buildingWidth;
        const y = 180 - height;
        
        // 빌딩 몸체
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, buildingWidth, height);
        
        // 창문
        ctx.fillStyle = '#FFFF00';
        const windowSize = buildingWidth / 4;
        const windowSpacing = buildingWidth / 8;
        
        for (let wx = x + windowSpacing; wx < x + buildingWidth - windowSize; wx += windowSpacing + windowSize) {
            for (let wy = y + windowSpacing; wy < 180 - windowSpacing; wy += windowSpacing + windowSize) {
                // 일부 창문만 켜져있게
                if (Math.random() > 0.3) {
                    ctx.fillRect(wx, wy, windowSize, windowSize);
                }
            }
        }
    }
    
    // 이미지 설정
    img.src = canvas.toDataURL('image/png');
    
    // 캡션 설정
    const caption = img.nextElementSibling;
    if (caption) {
        caption.textContent = '도시의 밤';
    }
}

// 크로키 예시 이미지 생성
function createCroquisExample(elementId, imagePath, captionText) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    const img = container.querySelector('img');
    if (img) {
        // 캔버스 생성
        const canvas = document.createElement('canvas');
        canvas.width = 220;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        // 크로키 스타일 예시 이미지 생성
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, 220, 120);
        
        if (elementId === 'croquis-example1') {
            // 인물 크로키
            drawHumanFigureCroquis(ctx);
        } else if (elementId === 'croquis-example2') {
            // 동물 크로키
            drawAnimalCroquis(ctx);
        } else {
            // 사물 크로키
            drawObjectCroquis(ctx);
        }
        
        // 이미지 경로 설정
        img.src = canvas.toDataURL('image/png');
        
        // 캡션 설정
        const caption = container.querySelector('p');
        if (caption) {
            caption.textContent = captionText;
        }
    }
}

// 인물 크로키 그리기
function drawHumanFigureCroquis(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // 머리
    ctx.beginPath();
    ctx.arc(110, 30, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // 몸통
    ctx.beginPath();
    ctx.moveTo(110, 45);
    ctx.lineTo(110, 80);
    ctx.stroke();
    
    // 팔
    ctx.beginPath();
    ctx.moveTo(110, 55);
    ctx.lineTo(90, 70);
    ctx.moveTo(110, 55);
    ctx.lineTo(130, 70);
    ctx.stroke();
    
    // 다리
    ctx.beginPath();
    ctx.moveTo(110, 80);
    ctx.lineTo(100, 110);
    ctx.moveTo(110, 80);
    ctx.lineTo(120, 110);
    ctx.stroke();
}

// 동물 크로키 그리기
function drawAnimalCroquis(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // 강아지 머리
    ctx.beginPath();
    ctx.arc(160, 50, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // 귀
    ctx.beginPath();
    ctx.moveTo(145, 40);
    ctx.lineTo(135, 25);
    ctx.moveTo(175, 40);
    ctx.lineTo(185, 25);
    ctx.stroke();
    
    // 몸통
    ctx.beginPath();
    ctx.moveTo(140, 50);
    ctx.lineTo(80, 60);
    ctx.stroke();
    
    // 다리
    ctx.beginPath();
    ctx.moveTo(90, 60);
    ctx.lineTo(85, 90);
    ctx.moveTo(110, 60);
    ctx.lineTo(105, 90);
    ctx.stroke();
    
    // 꼬리
    ctx.beginPath();
    ctx.moveTo(80, 60);
    ctx.lineTo(60, 40);
    ctx.stroke();
}

// 사물 크로키 그리기
function drawObjectCroquis(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // 컵
    ctx.beginPath();
    ctx.moveTo(80, 40);
    ctx.lineTo(80, 80);
    ctx.lineTo(120, 80);
    ctx.lineTo(120, 40);
    ctx.stroke();
    
    // 컵 손잡이
    ctx.beginPath();
    ctx.arc(130, 60, 10, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    // 과일 바구니
    ctx.beginPath();
    ctx.arc(170, 70, 25, 0, Math.PI);
    ctx.stroke();
    
    // 과일
    ctx.beginPath();
    ctx.arc(160, 60, 8, 0, Math.PI * 2);
    ctx.arc(180, 60, 10, 0, Math.PI * 2);
    ctx.stroke();
}

// 크로키 학생 작품 이미지 생성
function createCroquisStudentImage(altText, imagePath) {
    const img = document.querySelector(`.gallery-item img[alt="${altText}"]`);
    if (!img) return;
    
    // 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // 크로키 학생 작품 생성
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 220, 180);
    
    if (altText === '크로키 학생 작품 1') {
        // 인물 크로키 학생 작품
        drawStudentHumanCroquis(ctx);
    } else if (altText === '크로키 학생 작품 2') {
        // 동물 크로키 학생 작품
        drawStudentAnimalCroquis(ctx);
    } else {
        // 사물 크로키 학생 작품
        drawStudentObjectCroquis(ctx);
    }
    
    // 이미지 설정
    img.src = canvas.toDataURL('image/png');
}

// 인물 크로키 학생 작품
function drawStudentHumanCroquis(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    
    // 더 디테일한 인물 크로키
    // 머리
    ctx.beginPath();
    ctx.arc(110, 50, 25, 0, Math.PI * 2);
    ctx.stroke();
    
    // 얼굴 특징
    ctx.beginPath();
    ctx.moveTo(100, 45);
    ctx.lineTo(105, 45);
    ctx.moveTo(115, 45);
    ctx.lineTo(120, 45);
    ctx.moveTo(110, 50);
    ctx.lineTo(110, 55);
    ctx.moveTo(105, 65);
    ctx.lineTo(115, 65);
    ctx.stroke();
    
    // 몸통
    ctx.beginPath();
    ctx.moveTo(110, 75);
    ctx.lineTo(110, 130);
    ctx.stroke();
    
    // 어깨
    ctx.beginPath();
    ctx.moveTo(110, 85);
    ctx.lineTo(85, 90);
    ctx.moveTo(110, 85);
    ctx.lineTo(135, 90);
    ctx.stroke();
    
    // 팔
    ctx.beginPath();
    ctx.moveTo(85, 90);
    ctx.lineTo(75, 120);
    ctx.moveTo(135, 90);
    ctx.lineTo(145, 120);
    ctx.stroke();
    
    // 다리
    ctx.beginPath();
    ctx.moveTo(110, 130);
    ctx.lineTo(95, 170);
    ctx.moveTo(110, 130);
    ctx.lineTo(125, 170);
    ctx.stroke();
    
    // 손과 발의 디테일
    ctx.beginPath();
    ctx.arc(75, 120, 5, 0, Math.PI * 2);
    ctx.arc(145, 120, 5, 0, Math.PI * 2);
    ctx.arc(95, 170, 5, 0, Math.PI * 2);
    ctx.arc(125, 170, 5, 0, Math.PI * 2);
    ctx.stroke();
}

// 동물 크로키 학생 작품
function drawStudentAnimalCroquis(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    
    // 고양이 크로키
    // 머리
    ctx.beginPath();
    ctx.arc(120, 70, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // 귀
    ctx.beginPath();
    ctx.moveTo(100, 50);
    ctx.lineTo(90, 30);
    ctx.lineTo(110, 45);
    ctx.moveTo(140, 50);
    ctx.lineTo(150, 30);
    ctx.lineTo(130, 45);
    ctx.stroke();
    
    // 눈
    ctx.beginPath();
    ctx.arc(110, 65, 5, 0, Math.PI * 2);
    ctx.arc(130, 65, 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // 코와 입
    ctx.beginPath();
    ctx.moveTo(120, 75);
    ctx.lineTo(120, 80);
    ctx.moveTo(110, 80);
    ctx.lineTo(130, 80);
    ctx.stroke();
    
    // 수염
    ctx.beginPath();
    ctx.moveTo(120, 80);
    ctx.lineTo(100, 75);
    ctx.moveTo(120, 80);
    ctx.lineTo(100, 80);
    ctx.moveTo(120, 80);
    ctx.lineTo(100, 85);
    ctx.moveTo(120, 80);
    ctx.lineTo(140, 75);
    ctx.moveTo(120, 80);
    ctx.lineTo(140, 80);
    ctx.moveTo(120, 80);
    ctx.lineTo(140, 85);
    ctx.stroke();
    
    // 몸통
    ctx.beginPath();
    ctx.ellipse(120, 120, 30, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // 다리
    ctx.beginPath();
    ctx.moveTo(100, 130);
    ctx.lineTo(90, 160);
    ctx.moveTo(110, 135);
    ctx.lineTo(105, 165);
    ctx.moveTo(130, 135);
    ctx.lineTo(135, 165);
    ctx.moveTo(140, 130);
    ctx.lineTo(150, 160);
    ctx.stroke();
    
    // 꼬리
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.bezierCurveTo(170, 110, 190, 130, 180, 150);
    ctx.stroke();
}

// 사물 크로키 학생 작품
function drawStudentObjectCroquis(ctx) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    
    // 정물 크로키 (과일 바구니와 꽃병)
    // 테이블
    ctx.beginPath();
    ctx.moveTo(20, 130);
    ctx.lineTo(200, 130);
    ctx.stroke();
    
    // 과일 바구니
    ctx.beginPath();
    ctx.ellipse(70, 100, 40, 20, 0, 0, Math.PI);
    ctx.moveTo(30, 100);
    ctx.lineTo(40, 130);
    ctx.moveTo(110, 100);
    ctx.lineTo(100, 130);
    ctx.stroke();
    
    // 과일들
    ctx.beginPath();
    ctx.arc(50, 90, 10, 0, Math.PI * 2);
    ctx.arc(70, 85, 12, 0, Math.PI * 2);
    ctx.arc(90, 90, 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // 꽃병
    ctx.beginPath();
    ctx.moveTo(150, 60);
    ctx.lineTo(140, 130);
    ctx.lineTo(160, 130);
    ctx.lineTo(150, 60);
    ctx.stroke();
    
    // 꽃
    ctx.beginPath();
    ctx.moveTo(150, 60);
    ctx.lineTo(150, 30);
    ctx.moveTo(150, 50);
    ctx.lineTo(135, 35);
    ctx.moveTo(150, 50);
    ctx.lineTo(165, 35);
    ctx.moveTo(150, 45);
    ctx.lineTo(130, 55);
    ctx.moveTo(150, 45);
    ctx.lineTo(170, 55);
    ctx.stroke();
    
    // 꽃잎
    ctx.beginPath();
    ctx.arc(150, 30, 5, 0, Math.PI * 2);
    ctx.arc(135, 35, 4, 0, Math.PI * 2);
    ctx.arc(165, 35, 4, 0, Math.PI * 2);
    ctx.arc(130, 55, 3, 0, Math.PI * 2);
    ctx.arc(170, 55, 3, 0, Math.PI * 2);
    ctx.stroke();
} 