FROM amazon/aws-lambda-python:3.8

RUN yum install libglvnd-glx -y
RUN pip3 install --upgrade pip
RUN pip3 install scikit-build wheel
RUN pip3 install opencv-python==4.6.0.66 
RUN pip3 install dlr==1.6.0

RUN python -m pip install dlr
RUN python -m pip install joblib awsiotsdk pandas

WORKDIR /var/task/image-classifier

COPY classifier.py /var/task/
COPY inference.py /var/task/
COPY inference-test.py /var/task/

COPY . .

CMD ["inference-test.main"]
