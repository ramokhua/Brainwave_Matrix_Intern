<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Get all steps and set up navigation
        const steps = document.querySelectorAll('.grounding-step');
        const prevButtons = document.querySelectorAll('#prev-step');
        const nextButtons = document.querySelectorAll('#next-step');
        const startOverButton = document.getElementById('start-over');
        
        // Hide all steps except the first one
        steps.forEach(step => {
            if (!step.classList.contains('active')) {
                step.style.display = 'none';
            }
        });
        
        // Function to navigate between steps
        function navigateSteps(currentStepId, targetStepId) {
            const currentStep = document.getElementById(currentStepId);
            const targetStep = document.getElementById(targetStepId);
            
            if (currentStep && targetStep) {
                currentStep.style.display = 'none';
                targetStep.style.display = 'block';
                
                // Update active class
                currentStep.classList.remove('active');
                targetStep.classList.add('active');
                
                // Update step counter
                updateStepCounter(targetStepId);
            }
        }
        
        // Function to update step counter
        function updateStepCounter(stepId) {
            const stepCounters = document.querySelectorAll('.step-counter');
            let currentStepNumber, totalSteps;
            
            switch(stepId) {
                case 'step-5':
                    currentStepNumber = 1;
                    totalSteps = 5;
                    break;
                case 'step-4':
                    currentStepNumber = 2;
                    totalSteps = 5;
                    break;
                case 'step-3':
                    currentStepNumber = 3;
                    totalSteps = 5;
                    break;
                case 'step-2':
                    currentStepNumber = 4;
                    totalSteps = 5;
                    break;
                case 'step-1':
                    currentStepNumber = 5;
                    totalSteps = 5;
                    break;
                case 'completion-message':
                    currentStepNumber = 'Completed';
                    totalSteps = '';
                    break;
            }
            
            stepCounters.forEach(counter => {
                if (currentStepNumber === 'Completed') {
                    counter.textContent = 'Exercise Completed';
                } else {
                    counter.textContent = `Step ${currentStepNumber} of ${totalSteps}`;
                }
            });
            
            // Show/hide start over button
            if (stepId === 'completion-message') {
                startOverButton.style.display = 'inline-block';
            } else {
                startOverButton.style.display = 'none';
            }
        }
        
        // Set up event listeners for next buttons
        nextButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (this.getAttribute('onclick')) return; // Skip if already has onclick
                
                const currentStep = this.closest('.grounding-step');
                let nextStepId;
                
                switch(currentStep.id) {
                    case 'step-5':
                        nextStepId = 'step-4';
                        break;
                    case 'step-4':
                        nextStepId = 'step-3';
                        break;
                    case 'step-3':
                        nextStepId = 'step-2';
                        break;
                    case 'step-2':
                        nextStepId = 'step-1';
                        break;
                    case 'step-1':
                        nextStepId = 'completion-message';
                        break;
                }
                
                if (nextStepId) {
                    navigateSteps(currentStep.id, nextStepId);
                }
            });
        });
        
        // Set up event listeners for previous buttons
        prevButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (this.getAttribute('onclick')) return; // Skip if already has onclick
                
                const currentStep = this.closest('.grounding-step');
                let prevStepId;
                
                switch(currentStep.id) {
                    case 'step-4':
                        prevStepId = 'step-5';
                        break;
                    case 'step-3':
                        prevStepId = 'step-4';
                        break;
                    case 'step-2':
                        prevStepId = 'step-3';
                        break;
                    case 'step-1':
                        prevStepId = 'step-2';
                        break;
                }
                
                if (prevStepId) {
                    navigateSteps(currentStep.id, prevStepId);
                }
            });
        });
        
        // Start over button functionality
        startOverButton.addEventListener('click', function() {
            // Hide all steps
            steps.forEach(step => {
                step.style.display = 'none';
                step.classList.remove('active');
            });
            
            // Show first step
            document.getElementById('step-5').style.display = 'block';
            document.getElementById('step-5').classList.add('active');
            
            // Reset step counter
            updateStepCounter('step-5');
            
            // Clear all inputs
            document.querySelectorAll('.grounding-inputs input').forEach(input => {
                input.value = '';
            });
        });
        
        // Initialize step counter
        updateStepCounter('step-5');
    });
</script>
