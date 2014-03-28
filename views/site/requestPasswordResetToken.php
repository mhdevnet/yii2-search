<?php
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/**
 * @var yii\web\View $this
 * @var yii\widgets\ActiveForm $form
 * @var common\models\User $model
 */
$this->title = 'Request password reset';
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="site-request-password-reset">
	<div class="col-md-4 bg-light col-md-offset-4">
		<h1><?= Html::encode($this->title) ?></h1>
	
		<p>Please fill out your email. A link to reset password will be sent there.</p>
	
		<div class="row">
			<div class="col-lg-12 col-md-12">
				<?php $form = ActiveForm::begin(['id' => 'request-password-reset-form']); ?>
					<?= $form->field($model, 'email') ?>
					<div class="form-group">
						<?= Html::submitButton('Send', ['class' => 'btn btn-primary']) ?>
					</div>
				<?php ActiveForm::end(); ?>
			</div>
		</div>
	</div>
</div>
